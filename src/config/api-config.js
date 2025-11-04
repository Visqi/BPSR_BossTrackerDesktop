/**
 * Centralized API Configuration
 * This file contains all API-related settings used throughout the application
 * Update subscriptions and event handlers here ONCE instead of in multiple files
 */

// API Base URL
const API_BASE_URL = 'https://db.bptimer.com/api';

// SSE Event Types Configuration
// Add new event types here and they'll be automatically registered everywhere
const SSE_EVENT_TYPES = {
  // New compact event format (current)
  MOB_HP_UPDATES: 'mob_hp_updates',
  MOB_RESETS: 'mob_resets',
  
  // Old collection-based events (for backwards compatibility)
  MOB_CHANNEL_STATUS_SSE: 'mob_channel_status_sse',
  MOB_RESET_EVENTS: 'mob_reset_events',
  MOBS: 'mobs'
};

// PocketBase SSE Subscriptions
// These are sent to the server to subscribe to specific collections
// Note: New format uses event types directly, not collection wildcards
const SSE_SUBSCRIPTIONS = [
  SSE_EVENT_TYPES.MOB_HP_UPDATES,
  SSE_EVENT_TYPES.MOB_RESETS
  
  // Old format (commented out - using new format instead):
  // "mobs/*",
  // "mob_channel_status_sse/*",
  // "mob_reset_events/*"
];

// Collection Names for internal data handling
// These are the collection names used after parsing SSE events
const COLLECTIONS = {
  MOBS: 'mobs',
  MOB_CHANNEL_STATUS: 'mob_channel_status',          // Used by MOB_HP_UPDATES after parsing
  MOB_CHANNEL_STATUS_SSE: 'mob_channel_status_sse',  // Legacy SSE collection
  MOB_RESET_EVENTS: 'mob_reset_events'               // Used by MOB_RESETS after parsing
};

// Event Handler Configuration
// Maps event types to their processing functions
// This defines how each event type should be handled
const EVENT_HANDLERS = {
  [SSE_EVENT_TYPES.MOB_HP_UPDATES]: {
    // Format: [mobId, channelNumber, hp]
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
    // Format: mobId string or [mobId]
    parse: (data) => {
      const mobId = Array.isArray(data) ? data[0] : data;
      return {
        action: 'create',
        collection: COLLECTIONS.MOB_RESET_EVENTS,
        record: {
          mob: mobId
        }
      };
    },
    description: 'Boss reset event - all channels back to 100%'
  },
  
  [SSE_EVENT_TYPES.MOB_CHANNEL_STATUS_SSE]: {
    // Old format: PocketBase collection update
    parse: (data) => {
      data.collection = COLLECTIONS.MOB_CHANNEL_STATUS_SSE;
      return data;
    },
    description: 'Legacy channel status update (old format)'
  },
  
  [SSE_EVENT_TYPES.MOB_RESET_EVENTS]: {
    // Old format: PocketBase collection update
    parse: (data) => {
      data.collection = COLLECTIONS.MOB_RESET_EVENTS;
      return data;
    },
    description: 'Legacy reset event (old format)'
  },
  
  [SSE_EVENT_TYPES.MOBS]: {
    // Old format: PocketBase collection update
    parse: (data) => {
      data.collection = COLLECTIONS.MOBS;
      return data;
    },
    description: 'Mob data updates'
  }
};

// Export for CommonJS (Node.js - main process)
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
