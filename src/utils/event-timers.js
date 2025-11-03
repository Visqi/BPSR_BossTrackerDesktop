// Event Timer Constants and Functions

// Event configurations based on bptimer.com
const EVENT_CONFIGS = [
  {
    id: 'guild-hunt',
    name: 'Guild Hunt',
    icon: '🏹',
    schedule: {
      days: [5, 6, 0], // Friday, Saturday, Sunday (0 = Sunday)
      hour: 14,
      minute: 0,
      durationHours: 14
    }
  },
  {
    id: 'world-boss',
    name: 'World Boss',
    icon: '🐉',
    schedule: {
      days: [0, 1, 2, 3, 4, 5, 6], // Every day
      hour: 16,
      minute: 0,
      durationHours: 6
    }
  },
  {
    id: 'guild-dance',
    name: 'Guild Dance',
    icon: '💃',
    schedule: {
      days: [5, 6, 0], // Friday, Saturday, Sunday
      hour: 14,
      minute: 0,
      durationHours: 14
    }
  },
  {
    id: 'stimen-vaults',
    name: 'Stimen Vaults',
    icon: '🏛️',
    schedule: {
      resetType: 'biweekly', // Resets every 2 weeks
      resetDay: 3, // Wednesday
      hour: 4,
      minute: 0
    }
  },
  {
    id: 'daily-reset',
    name: 'Daily Reset',
    icon: '🌅',
    schedule: {
      resetType: 'daily',
      hour: 4,
      minute: 0
    }
  },
  {
    id: 'weekly-reset',
    name: 'Weekly Reset',
    icon: '📅',
    schedule: {
      resetType: 'weekly',
      resetDay: 3, // Wednesday
      hour: 4,
      minute: 0
    }
  }
];

// Game timezone offset (UTC+8 for China server)
const GAME_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;

function getNextEventTime(event) {
  const now = new Date();
  const gameNow = new Date(now.getTime() + GAME_TIMEZONE_OFFSET);
  
  if (event.schedule.resetType === 'daily') {
    // Daily reset at 04:00 game time
    const nextReset = new Date(gameNow);
    nextReset.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    
    if (gameNow >= nextReset) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
    
    return new Date(nextReset.getTime() - GAME_TIMEZONE_OFFSET);
  }
  
  if (event.schedule.resetType === 'weekly') {
    // Weekly reset on specific day at 04:00 game time
    const nextReset = new Date(gameNow);
    nextReset.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    
    const currentDay = gameNow.getDay();
    const targetDay = event.schedule.resetDay;
    let daysUntilReset = targetDay - currentDay;
    
    if (daysUntilReset < 0 || (daysUntilReset === 0 && gameNow >= nextReset)) {
      daysUntilReset += 7;
    }
    
    nextReset.setDate(nextReset.getDate() + daysUntilReset);
    return new Date(nextReset.getTime() - GAME_TIMEZONE_OFFSET);
  }
  
  if (event.schedule.resetType === 'biweekly') {
    // Biweekly reset (every 2 weeks)
    // Reference date: First reset on 2025-01-01 (Wednesday)
    const referenceDate = new Date('2025-01-01T04:00:00Z');
    const daysSinceReference = Math.floor((gameNow - referenceDate) / (24 * 60 * 60 * 1000));
    const daysSinceLastReset = daysSinceReference % 14;
    const daysUntilNextReset = 14 - daysSinceLastReset;
    
    const nextReset = new Date(gameNow);
    nextReset.setDate(nextReset.getDate() + daysUntilNextReset);
    nextReset.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    
    return new Date(nextReset.getTime() - GAME_TIMEZONE_OFFSET);
  }
  
  // Regular events with specific days and duration
  if (event.schedule.days) {
    const nextStart = new Date(gameNow);
    nextStart.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    
    const currentDay = gameNow.getDay();
    const validDays = event.schedule.days;
    
    // Check if event is currently active
    const eventEnd = new Date(nextStart.getTime() + event.schedule.durationHours * 60 * 60 * 1000);
    if (validDays.includes(currentDay) && gameNow >= nextStart && gameNow < eventEnd) {
      // Event is active, return end time
      return {
        nextTime: new Date(eventEnd.getTime() - GAME_TIMEZONE_OFFSET),
        isActive: true
      };
    }
    
    // Find next occurrence
    for (let i = 0; i <= 7; i++) {
      const checkDate = new Date(gameNow);
      checkDate.setDate(checkDate.getDate() + i);
      const checkDay = checkDate.getDay();
      
      if (validDays.includes(checkDay)) {
        const eventStart = new Date(checkDate);
        eventStart.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
        
        if (eventStart > gameNow || i > 0) {
          return {
            nextTime: new Date(eventStart.getTime() - GAME_TIMEZONE_OFFSET),
            isActive: false
          };
        }
      }
    }
  }
  
  return { nextTime: now, isActive: false };
}

function formatCountdown(ms) {
  if (ms <= 0) return '0s';
  
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && days === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

module.exports = {
  EVENT_CONFIGS,
  getNextEventTime,
  formatCountdown
};
