const EventEmitter = require('events');
const https = require('https');
const EventSource = require('eventsource');
const { 
  API_BASE_URL, 
  SSE_EVENT_TYPES, 
  SSE_SUBSCRIPTIONS, 
  COLLECTIONS,
  EVENT_HANDLERS 
} = require('../config/api-config');

class APIService extends EventEmitter {
  constructor() {
    super();
    this.baseURL = API_BASE_URL;
    this.bossData = null;
    this.eventSource = null;
    this.channelStatusMap = new Map(); // Map of bossId_channelNumber -> channel data
    this.subscriptions = new Set();
  }

  /**
   * Fetch boss data from the API
   */
  async loadBossData() {
    return new Promise((resolve, reject) => {
      // Load both bosses AND magical creatures (remove type filter or use type='boss' OR type='magical-creature')
      const url = `${this.baseURL}/collections/mobs/records?page=1&perPage=500&skipTotal=1&sort=uid&expand=map`;
      
      console.log('Fetching boss and magical creature data...');
      
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            this.bossData = parsed.items.map(boss => ({
              id: boss.id,
              uid: boss.uid,
              name: boss.name,
              type: boss.type,
              totalChannels: boss.expand?.map?.total_channels || 50,
              map: boss.expand?.map ? {
                id: boss.expand.map.id,
                name: boss.expand.map.name,
                totalChannels: boss.expand.map.total_channels,
                uid: boss.expand.map.uid
              } : null
            }));
            
            const bosses = this.bossData.filter(m => m.type === 'boss');
            const creatures = this.bossData.filter(m => m.type === 'magical_creature' || m.type === 'magical-creature');
            console.log(`Loaded ${bosses.length} bosses and ${creatures.length} magical creatures`);
            console.log('Boss data types:', [...new Set(this.bossData.map(m => m.type))]);
            
            this.emit('boss-data-loaded', this.bossData);
            
            // After loading bosses, load channel status for all
            this.loadAllChannelStatus().then(() => {
              resolve(this.bossData);
            }).catch(reject);
          } catch (error) {
            console.error('Error parsing boss data:', error);
            reject(error);
          }
        });
      }).on('error', (error) => {
        console.error('Error fetching boss data:', error);
        reject(error);
      });
    });
  }

  /**
   * Load channel status for all bosses with pagination
   */
  async loadAllChannelStatus() {
    console.log('Fetching all channel status...');
    
    // Clear existing channel status
    this.channelStatusMap.clear();
    
    let page = 1;
    let hasMore = true;
    let totalLoaded = 0;
    
    try {
      while (hasMore) {
        // PocketBase max is 500 per page for optimal performance
        const url = `${this.baseURL}/collections/mob_channel_status/records?page=${page}&perPage=500&skipTotal=0`;
        
        const data = await this.fetchPage(url);
        const parsed = JSON.parse(data);
        
        // Store each channel status
        parsed.items.forEach(item => {
          const key = `${item.mob}_${item.channel_number}`;
          const hp = item.last_hp || 0;
          const lastUpdate = item.last_update || item.updated;
          
          this.channelStatusMap.set(key, {
            bossId: item.mob,
            channelNumber: item.channel_number,
            hp: hp,
            lastUpdate: lastUpdate,
            status: this.getChannelStatus(hp, lastUpdate)
          });
        });
        
        totalLoaded += parsed.items.length;
        console.log(`Loaded page ${page}: ${parsed.items.length} records (total: ${totalLoaded}/${parsed.totalItems || '?'})`);
        
        // Check if there are more pages
        hasMore = parsed.items.length === 500 && totalLoaded < (parsed.totalItems || 0);
        page++;
      }
      
      // Log statistics
      const uniqueBosses = new Set(Array.from(this.channelStatusMap.values()).map(c => c.bossId));
      console.log(`✓ Loaded ${this.channelStatusMap.size} channel statuses for ${uniqueBosses.size} bosses/creatures`);
      
      this.emit('channel-data-loaded');
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading channel status:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Helper function to fetch a single page
   */
  fetchPage(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }
  /**
   * Determine channel status based on HP and last update
   * Implements stale data filtering like the original bptimer
   */
  getChannelStatus(hp, lastUpdate) {
    // Dead channels (0% HP) never go stale
    if (hp === 0) return 'dead';
    
    // Check if data is stale based on HP percentage
    if (this.isDataStale(lastUpdate, hp)) {
      return 'unknown';
    }
    
    // Alive with fresh data
    if (hp > 0) return 'alive';
    
    return 'unknown';
  }

  /**
   * Check if channel data is stale based on HP-based timeouts
   * Same logic as original bptimer.com
   */
  isDataStale(lastUpdate, hpPercentage) {
    if (!lastUpdate) return true;
    
    // Dead mobs (0% HP) never go stale
    if (hpPercentage === 0) return false;
    
    const STALE_TIMEOUT_FULL_HP = 10 * 60 * 1000; // 10 minutes for 100% HP
    const STALE_TIMEOUT_HIGH_HP = 7 * 60 * 1000;  // 7 minutes for 80-99% HP
    const STALE_TIMEOUT_DEFAULT = 5 * 60 * 1000;  // 5 minutes for < 80% HP
    
    let timeout = STALE_TIMEOUT_DEFAULT;
    
    if (hpPercentage === 100) {
      timeout = STALE_TIMEOUT_FULL_HP;
    } else if (hpPercentage >= 80) {
      timeout = STALE_TIMEOUT_HIGH_HP;
    }
    
    const updateTime = new Date(lastUpdate).getTime();
    const now = Date.now();
    
    return (now - updateTime) > timeout;
  }

  /**
   * Connect to realtime SSE endpoint for live updates
   */
  connectRealtime() {
    console.log('Connecting to PocketBase realtime SSE...');
    
    if (this.eventSource) {
      this.eventSource.close();
    }

    // Connect to the realtime endpoint
    const realtimeURL = `${this.baseURL}/realtime`;
    this.eventSource = new EventSource(realtimeURL);

    this.eventSource.onopen = () => {
      console.log('SSE Connection opened');
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.emit('connection-error', error);
      
      // Auto-reconnect after delay
      setTimeout(() => {
        if (this.eventSource && this.eventSource.readyState === EventSource.CLOSED) {
          console.log('Reconnecting to SSE...');
          this.connectRealtime();
        }
      }, 5000);
    };

    // Handle PocketBase connection event - this gives us the clientId
    this.eventSource.addEventListener('PB_CONNECT', (event) => {
      console.log('🎯 PB_CONNECT event received!');
      const data = JSON.parse(event.data);
      console.log('✓ PocketBase SSE connected with clientId:', data.clientId);
      
      // Now POST the subscription to start receiving events
      this.subscribeToCollections(data.clientId);
    });

    // Listen for collection-specific events
    // PocketBase sends events with the collection name as the event type
    this.eventSource.addEventListener('mob_channel_status_sse', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('✓ Received mob_channel_status_sse event:', data.action, 'for mob:', data.record?.mob, 'channel:', data.record?.channel_number, 'HP:', data.record?.last_hp);
        // Add collection name since it comes from event type, not data
        data.collection = 'mob_channel_status_sse';
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('Error parsing mob_channel_status_sse event:', error);
      }
    });
    
    // NEW: Listen for mob HP updates (new API format)
    this.eventSource.addEventListener('mob_hp_updates', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('✓ Received mob_hp_updates event:', data);
        
        // Data format: [mobId, channelNumber, hp]
        if (Array.isArray(data) && data.length === 3) {
          const [mobId, channelNumber, hp] = data;
          console.log(`HP Update: Mob ${mobId}, Channel ${channelNumber}, HP ${hp}%`);
          
          // Convert to standard format
          this.handleRealtimeEvent({
            action: 'update',
            collection: 'mob_channel_status',
            record: {
              mob: mobId,
              channel_number: channelNumber,
              last_hp: hp,
              last_update: new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.error('Error parsing mob_hp_updates event:', error);
      }
    });

    this.eventSource.addEventListener('mobs', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('✓ Received mobs event:', data.action);
        data.collection = 'mobs';
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('Error parsing mobs event:', error);
      }
    });

    this.eventSource.addEventListener('mob_reset_events', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('✓ Received mob_reset_events event:', data.action);
        data.collection = 'mob_reset_events';
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('Error parsing mob_reset_events event:', error);
      }
    });
    
    // NEW: Listen for mob reset events (new API format)
    this.eventSource.addEventListener('mob_resets', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('✓ Received mob_resets event:', data);
        
        // Data could be mobId string or array
        const mobId = Array.isArray(data) ? data[0] : data;
        console.log(`Boss Reset: Mob ${mobId}`);
        
        // Convert to standard format
        this.handleRealtimeEvent({
          action: 'create',
          collection: 'mob_reset_events',
          record: {
            mob: mobId
          }
        });
      } catch (error) {
        console.error('Error parsing mob_resets event:', error);
      }
    });

    // Listen to ALL event types to debug
    this.eventSource.addEventListener('message', (event) => {
      console.log('📩 Generic message event received:', event.data?.substring(0, 150));
      try {
        const data = JSON.parse(event.data);
        console.log('📩 Parsed message:', data);
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('Error parsing message event:', error);
      }
    });

    // Generic message handler (fallback) - this catches ALL SSE messages
    this.eventSource.onmessage = (event) => {
      console.log('📨 onmessage triggered!');
      console.log('📨 Event type:', event.type);
      console.log('📨 Event data:', event.data?.substring(0, 200));
      
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Parsed data:', data);
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };
  }
  /**
   * Subscribe to PocketBase collections using clientId
   */
  subscribeToCollections(clientId) {
    // Use centralized subscription configuration
    const postData = JSON.stringify({
      clientId: clientId,
      subscriptions: SSE_SUBSCRIPTIONS
    });
    
    console.log('Sending subscription POST:', { clientId, subscriptions: SSE_SUBSCRIPTIONS });
    
    const options = {
      hostname: 'db.bptimer.com',
      port: 443,
      path: '/api/realtime',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      console.log('Subscription response status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('✓ Subscription response:', data || 'OK');
        console.log('✓ Reconnecting SSE with clientId...');
        
        // Close the current SSE connection
        if (this.eventSource) {
          this.eventSource.close();
        }
        
        // Reconnect with clientId in query string
        const realtimeURL = `${this.baseURL}/realtime?clientId=${clientId}`;
        console.log('Reconnecting to:', realtimeURL);
        
        this.eventSource = new EventSource(realtimeURL);
        
        this.eventSource.onopen = () => {
          console.log('✓ SSE Reconnected with clientId');
          this.emit('connected');
        };
        
        this.eventSource.onerror = (error) => {
          console.error('SSE error after reconnect:', error);
        };
        
        // Re-register event listeners
        this.registerEventListeners();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Subscription POST error:', error);
    });
    
    req.write(postData);
    req.end();
  }

  /**
   * Register all event listeners for SSE
   */
  registerEventListeners() {
    if (!this.eventSource) return;
    
    console.log('Registering event listeners for:', Object.keys(EVENT_HANDLERS));
    
    // Dynamically register event listeners for all configured event types
    Object.entries(EVENT_HANDLERS).forEach(([eventType, handler]) => {
      this.eventSource.addEventListener(eventType, (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`✓ Received ${eventType} event:`, data);
          
          // Use the handler's parse function to transform the data
          const parsedData = handler.parse(data);
          
          if (parsedData) {
            console.log(`✓ Handling ${eventType}:`, parsedData);
            this.handleRealtimeEvent(parsedData);
          }
        } catch (error) {
          console.error(`Error parsing ${eventType} event:`, error);
        }
      });
    });
  }

  /**
   * Handle realtime SSE events
   */
  handleRealtimeEvent(data) {
    if (!data || !data.action) return;

    // Extract collection name from either top-level or from record.collectionName
    const collection = data.collection || data.record?.collectionName;
    const { action, record } = data;
    
    console.log(`📦 Handling event: collection=${collection}, action=${action}`);

    // Handle mob_channel_status_sse updates (the SSE-specific collection)
    // Also handle mob_channel_status (new format from mob_hp_updates)
    if (collection === COLLECTIONS.MOB_CHANNEL_STATUS_SSE || collection === COLLECTIONS.MOB_CHANNEL_STATUS) {
      this.handleChannelStatusUpdate(action, record);
    }
    // Handle mob updates
    else if (collection === COLLECTIONS.MOBS) {
      this.handleBossUpdate(action, record);
    }
    // Handle reset events
    else if (collection === COLLECTIONS.MOB_RESET_EVENTS) {
      this.handleResetEvent(action, record);
    }
    else {
      console.log(`⚠️ Unknown collection: ${collection}`);
    }
  }

  /**
   * Handle channel status updates from SSE
   */
  handleChannelStatusUpdate(action, record) {
    if (!record || !record.mob || record.channel_number === undefined) {
      console.warn('Invalid channel status record:', record);
      return;
    }

    const key = `${record.mob}_${record.channel_number}`;
    
    if (action === 'delete') {
      this.channelStatusMap.delete(key);
      console.log(`Channel ${key} deleted`);
    } else {
      // Update or create channel status
      const hp = record.last_hp || 0;
      const lastUpdate = record.last_update || record.updated;
      
      this.channelStatusMap.set(key, {
        bossId: record.mob,
        channelNumber: record.channel_number,
        hp: hp,
        lastUpdate: lastUpdate,
        status: this.getChannelStatus(hp, lastUpdate)
      });
      
      console.log(`Channel ${key} updated: ${hp}% HP`);
    }

    // Emit update event
    console.log('Emitting channel-update event for boss:', record.mob);
    this.emit('channel-update', {
      bossId: record.mob,
      channelNumber: record.channel_number,
      channelData: this.channelStatusMap.get(key)
    });
  }

  /**
   * Handle boss updates from SSE
   */
  handleBossUpdate(action, record) {
    if (!this.bossData) return;

    const index = this.bossData.findIndex(b => b.id === record.id);
    
    if (action === 'update' && index !== -1) {
      this.bossData[index] = {
        ...this.bossData[index],
        ...record
      };
      this.emit('boss-update', record);
    }
  }

  /**
   * Handle reset events - boss respawned, all channels back to 100%
   */
  handleResetEvent(action, record) {
    if (action === 'create' && record.mob) {
      console.log(`Boss ${record.mob} reset`);
      
      // Reset all channels for this boss to 100% HP
      const boss = this.bossData?.find(b => b.id === record.mob);
      if (boss) {
        for (let i = 1; i <= boss.totalChannels; i++) {
          const key = `${record.mob}_${i}`;
          this.channelStatusMap.set(key, {
            bossId: record.mob,
            channelNumber: i,
            hp: 100,
            lastUpdate: new Date().toISOString(),
            status: 'alive'
          });
        }
        
        this.emit('boss-reset', { bossId: record.mob });
      }
    }
  }

  /**
   * Get all channel status for a boss
   * Recalculates status to filter stale data
   */
  getBossChannels(bossId) {
    const channels = [];
    const boss = this.bossData?.find(b => b.id === bossId);
    
    if (!boss) return [];

    for (let i = 1; i <= boss.totalChannels; i++) {
      const key = `${bossId}_${i}`;
      const channelData = this.channelStatusMap.get(key);
      
      if (channelData) {
        // Recalculate status in case data became stale
        const currentStatus = this.getChannelStatus(channelData.hp, channelData.lastUpdate);
        channels.push({
          ...channelData,
          status: currentStatus
        });
      } else {
        channels.push({
          bossId,
          channelNumber: i,
          hp: 100,
          lastUpdate: null,
          status: 'unknown'
        });
      }
    }

    return channels;
  }

  /**
   * Get alive channels for a boss (HP > 0 and fresh data)
   */
  getAliveChannels(bossId) {
    return this.getBossChannels(bossId)
      .filter(ch => ch.status === 'alive' && ch.hp > 0)
      .sort((a, b) => a.hp - b.hp); // Sort by HP ascending
  }

  /**
   * Get all bosses
   */
  getBosses() {
    return this.bossData || [];
  }

  /**
   * Disconnect from realtime updates
   */
  disconnect() {
    if (this.eventSource) {
      console.log('Disconnecting from SSE');
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}

module.exports = APIService;
