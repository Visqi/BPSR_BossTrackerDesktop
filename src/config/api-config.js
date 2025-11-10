/**
 * Centralized API Configuration
 * Single source of truth for all API-related settings
 */

const API_BASE_URL = 'https://db.bptimer.com/api';

const SSE_EVENT_TYPES = {
  MOB_HP_UPDATES: 'mob_hp_updates',
  MOB_RESETS: 'mob_resets',
  MOB_CHANNEL_STATUS_SSE: 'mob_channel_status_sse',
  MOB_RESET_EVENTS: 'mob_reset_events',
  MOBS: 'mobs'
};

const SSE_SUBSCRIPTIONS = [
  SSE_EVENT_TYPES.MOB_HP_UPDATES,
  SSE_EVENT_TYPES.MOB_RESETS
];

const COLLECTIONS = {
  MOBS: 'mobs',
  MOB_CHANNEL_STATUS: 'mob_channel_status',
  MOB_CHANNEL_STATUS_SSE: 'mob_channel_status_sse',
  MOB_RESET_EVENTS: 'mob_reset_events'
};

const EVENT_HANDLERS = {
  [SSE_EVENT_TYPES.MOB_HP_UPDATES]: {
    // New format: Array of updates [[mobId, channel, hp, extra], [mobId, channel, hp, extra], ...]
    // Example: [["2p85mgkxeou96jf",176,0,null],["2p85mgkxeou96jf",175,80,null],["oej5xgi3vn0quou",80,45,null]]
    parse: (data) => {
      // Check if data is an array of arrays (multi-dimensional)
      if (Array.isArray(data) && data.length > 0) {
        // Check if first element is an array (multi-dimensional format)
        if (Array.isArray(data[0])) {
          // Multi-dimensional: return array of updates
          return data.map(update => {
            const [mobId, channelNumber, hp] = update;
            return {
              action: 'update',
              collection: COLLECTIONS.MOB_CHANNEL_STATUS,
              record: {
                mob: mobId,
                channel_number: channelNumber,
                last_hp: hp,
                last_update: new Date().toISOString()
              }
            };
          });
        } else if (data.length === 3 || data.length === 4) {
          // Legacy single update format: [mobId, channel, hp] or [mobId, channel, hp, extra]
          const [mobId, channelNumber, hp] = data;
          return {
            action: 'update',
            collection: COLLECTIONS.MOB_CHANNEL_STATUS,
            record: {
              mob: mobId,
              channel_number: channelNumber,
              last_hp: hp,
              last_update: new Date().toISOString()
            }
          };
        }
      }
      
      return null;
    },
    description: 'HP update for mob channels (supports both single and multi-dimensional updates)'
  },
  
  [SSE_EVENT_TYPES.MOB_RESETS]: {
    parse: (data) => {
      const mobId = Array.isArray(data) ? data[0] : data;
      return {
        action: 'create',
        collection: COLLECTIONS.MOB_RESET_EVENTS,
        record: { mob: mobId }
      };
    },
    description: 'Boss reset event'
  },
  
  [SSE_EVENT_TYPES.MOB_CHANNEL_STATUS_SSE]: {
    parse: (data) => {
      data.collection = COLLECTIONS.MOB_CHANNEL_STATUS_SSE;
      return data;
    },
    description: 'Legacy channel status update'
  },
  
  [SSE_EVENT_TYPES.MOB_RESET_EVENTS]: {
    parse: (data) => {
      data.collection = COLLECTIONS.MOB_RESET_EVENTS;
      return data;
    },
    description: 'Legacy reset event'
  },
  
  [SSE_EVENT_TYPES.MOBS]: {
    parse: (data) => {
      data.collection = COLLECTIONS.MOBS;
      return data;
    },
    description: 'Mob data updates'
  }
};

// Export for CommonJS (Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_BASE_URL,
    SSE_EVENT_TYPES,
    SSE_SUBSCRIPTIONS,
    COLLECTIONS,
    EVENT_HANDLERS
  };
}

// Export for ES6 modules (browser - renderer process)
if (typeof window !== 'undefined') {
  window.API_CONFIG = {
    API_BASE_URL,
    SSE_EVENT_TYPES,
    SSE_SUBSCRIPTIONS,
    COLLECTIONS,
    EVENT_HANDLERS
  };
}
