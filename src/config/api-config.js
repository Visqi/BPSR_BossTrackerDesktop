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

// Magical Creature Location Definitions
// Maps location IDs to readable names for each creature
const MOB_LOCATIONS = {
  '10900': { // Golden Nappo (rbghfqu1d9ly9tt)
    name: 'Golden Nappo',
    mapUrl: 'https://bptimer.com/images/magical-creatures/maps/golden_nappo.webp',
    locations: {
      1: 'BEECH',
      2: 'CR',
      3: 'MUKU',
      4: 'FARM',
      5: 'BL',
      6: 'RUINS'
    }
  },
  '10901': { // Silver Nappo (2p85mgkxeou96jf)
    name: 'Silver Nappo',
    mapUrl: 'https://bptimer.com/images/magical-creatures/maps/silver_nappo.webp',
    locations: {
      1: 'BEECH',
      2: 'LONE',
      3: 'CR',
      4: 'SCOUT 1',
      5: 'SCOUT 2',
      6: 'MUKU 1',
      7: 'MUKU 2',
      8: 'FARM',
      9: 'BL',
      10: 'RUINS 1',
      11: 'RUINS 2'
    }
  },
  '10902': { // Breezy Boarlet (bhh5jhkhz7tzsdi)
    name: 'Breezy Boarlet',
    mapUrl: 'https://bptimer.com/images/magical-creatures/maps/breezy_boarlet.webp',
  },
  '10903': { // Lovely Boarlet (f2kqys0vkvrng7q)
    name: 'Lovely Boarlet',
    mapUrl: 'https://bptimer.com/images/magical-creatures/maps/lovely_boarlet.webp',
  },
  '10904': { // Loyal Boarlet (flpn6xsffc0cvn3)
    name: 'Loyal Boarlet',
    mapUrl: 'https://bptimer.com/images/magical-creatures/maps/loyal_boarlet.webp',
    locations: {
      1: 'CR',
      2: 'SCOUT 1',
      3: 'SCOUT 2',
      4: 'SCOUT 3',
      5: 'MUKU',
      6: 'FARM',
      7: 'REST 1',
      8: 'REST 2'
    }
  }
};

// Map DB mob IDs to monster IDs
const MOB_ID_TO_MONSTER_ID = {
  'bhh5jhkhz7tzsdi': '10900', // Golden Nappo
  'f2kqys0vkvrng7q': '10901', // Silver Nappo
  'flpn6xsffc0cvn3': '10904', // Loyal Boarlet
  'rbghfqu1d9ly9tt': '10902', // Breezy Boarlet
  '2p85mgkxeou96jf': '10903'  // Lovely Boarlet
};

// Helper function to get location name
function getLocationName(mobId, locationId) {
  const monsterId = MOB_ID_TO_MONSTER_ID[mobId];
  if (!monsterId || !MOB_LOCATIONS[monsterId]) {
    return null;
  }
  
  const location = MOB_LOCATIONS[monsterId].locations[locationId];
  return location || null;
}

// Helper function to get map URL
function getMapUrl(mobId) {
  const monsterId = MOB_ID_TO_MONSTER_ID[mobId];
  if (!monsterId || !MOB_LOCATIONS[monsterId]) {
    return null;
  }
  
  return MOB_LOCATIONS[monsterId].mapUrl;
}

const EVENT_HANDLERS = {
  [SSE_EVENT_TYPES.MOB_HP_UPDATES]: {
    // New format: Array of updates [[mobId, channel, hp, reporterId, locationId], ...]
    // Example: [["2p85mgkxeou96jf",176,0,"userId123",null],["f2kqys0vkvrng7q",3,95,"userId456",1]]
    // reporterId (4th element) = User who reported the HP
    // locationId (5th element) = Optional location ID for magical creatures (1-11 for different spawn points)
    parse: (data) => {
      // Check if data is an array of arrays (multi-dimensional)
      if (Array.isArray(data) && data.length > 0) {
        // Check if first element is an array (multi-dimensional format)
        if (Array.isArray(data[0])) {
          // Multi-dimensional: return array of updates
          return data.map(update => {
            const [mobId, channelNumber, hp, reporterId, locationId] = update;
            const record = {
              mob: mobId,
              channel_number: channelNumber,
              last_hp: hp,
              last_update: new Date().toISOString()
            };
            
            // Add reporter if present
            if (reporterId != null) {
              record.reporter = reporterId;
            }
            
            // Add location_image if present (not null/undefined)
            if (locationId != null) {
              record.location_image = locationId;
            }
            
            return {
              action: 'update',
              collection: COLLECTIONS.MOB_CHANNEL_STATUS,
              record
            };
          });
        } else if (data.length >= 3) {
          // Legacy single update format: [mobId, channel, hp] or [mobId, channel, hp, reporterId, locationId]
          const [mobId, channelNumber, hp, reporterId, locationId] = data;
          const record = {
            mob: mobId,
            channel_number: channelNumber,
            last_hp: hp,
            last_update: new Date().toISOString()
          };
          
          // Add reporter if present
          if (reporterId != null) {
            record.reporter = reporterId;
          }
          
          // Add location_image if present (not null/undefined)
          if (locationId != null) {
            record.location_image = locationId;
          }
          
          return {
            action: 'update',
            collection: COLLECTIONS.MOB_CHANNEL_STATUS,
            record
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
    EVENT_HANDLERS,
    MOB_LOCATIONS,
    MOB_ID_TO_MONSTER_ID,
    getLocationName,
    getMapUrl
  };
}

// Export for ES6 modules (browser - renderer process)
if (typeof window !== 'undefined') {
  window.API_CONFIG = {
    API_BASE_URL,
    SSE_EVENT_TYPES,
    SSE_SUBSCRIPTIONS,
    COLLECTIONS,
    EVENT_HANDLERS,
    MOB_LOCATIONS,
    MOB_ID_TO_MONSTER_ID,
    getLocationName,
    getMapUrl
  };
}
