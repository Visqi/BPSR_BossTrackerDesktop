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
    // Example: ["g1vqd4mkcexkii7", 35, 0] = Mob ID, Channel 35, 0% HP
    parse: (data) => {
      if (Array.isArray(data) && data.length === 3) {
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
      
      return null;
    },
    description: 'HP update for a specific mob channel'
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
