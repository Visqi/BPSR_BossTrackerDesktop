// Magical Creatures Constants

const MAGICAL_CREATURES = [
  {
    id: 'lovely_boarlet',
    name: 'Lovely Boarlet',
    type: 'magical-creature',
    icon: '🐗',
    description: 'A lovely boar creature',
    resetHours: [12, 16, 20], // UTC hours
    locations: ['Central Area']
  },
  {
    id: 'breezy_boarlet',
    name: 'Breezy Boarlet',
    type: 'magical-creature',
    icon: '🌬️',
    description: 'A breezy boar creature',
    resetHours: [14, 18, 22], // UTC hours
    locations: ['Mountain Region']
  },
  {
    id: 'loyal_boarlet',
    name: 'Loyal Boarlet',
    type: 'magical-creature',
    icon: '💙',
    description: 'A loyal boar creature',
    resetType: 'location-based',
    locations: [
      'Location 1',
      'Location 2',
      'Location 3',
      'Location 4',
      'Location 5',
      'Location 6',
      'Location 7',
      'Location 8'
    ]
  },
  {
    id: 'golden_nappo',
    name: 'Golden Nappo',
    type: 'magical-creature',
    icon: '⭐',
    description: 'A rare golden nappo',
    resetType: 'location-based',
    locations: [
      'Desert Area 1',
      'Desert Area 2',
      'Desert Area 3',
      'Desert Area 4',
      'Desert Area 5',
      'Desert Area 6'
    ]
  },
  {
    id: 'silver_nappo',
    name: 'Silver Nappo',
    type: 'magical-creature',
    icon: '🌙',
    description: 'A rare silver nappo',
    resetType: 'location-based',
    locations: [
      'Forest Area 1',
      'Forest Area 2',
      'Forest Area 3',
      'Forest Area 4',
      'Forest Area 5',
      'Forest Area 6',
      'Forest Area 7',
      'Forest Area 8',
      'Forest Area 9',
      'Forest Area 10',
      'Forest Area 11'
    ]
  }
];

// Game timezone offset (UTC+8 for China server)
const GAME_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;

function getNextCreatureReset(creature) {
  if (!creature.resetHours) {
    // Location-based creatures don't have scheduled resets
    return null;
  }
  
  const now = new Date();
  const gameNow = new Date(now.getTime() + GAME_TIMEZONE_OFFSET);
  
  // Find next reset time
  const today = new Date(gameNow);
  today.setMinutes(0, 0, 0);
  
  for (const hour of creature.resetHours) {
    const resetTime = new Date(today);
    resetTime.setHours(hour);
    
    if (resetTime > gameNow) {
      return new Date(resetTime.getTime() - GAME_TIMEZONE_OFFSET);
    }
  }
  
  // If no reset today, get first reset tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(creature.resetHours[0]);
  
  return new Date(tomorrow.getTime() - GAME_TIMEZONE_OFFSET);
}

function formatCreatureCountdown(ms) {
  if (ms <= 0) return 'Available now';
  
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

module.exports = {
  MAGICAL_CREATURES,
  getNextCreatureReset,
  formatCreatureCountdown
};
