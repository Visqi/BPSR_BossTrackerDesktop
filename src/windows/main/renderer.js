// Main window renderer - Channel HP tracking

// ============ EVENT TIMER UTILITIES ============
const EVENT_CONFIGS = [
  {
    id: 'guild-hunt',
    name: 'Guild Hunt',
    icon: '🏹',
    schedule: {
      days: [5, 6, 0], // Friday, Saturday, Sunday
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
      resetType: 'biweekly',
      resetDay: 3,
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
      resetDay: 3,
      hour: 4,
      minute: 0
    }
  }
];

const GAME_TIMEZONE_OFFSET = 8 * 60 * 60 * 1000;

function getNextEventTime(event) {
  const now = new Date();
  const gameNow = new Date(now.getTime() + GAME_TIMEZONE_OFFSET);
  
  if (event.schedule.resetType === 'daily') {
    const nextReset = new Date(gameNow);
    nextReset.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    if (gameNow >= nextReset) nextReset.setDate(nextReset.getDate() + 1);
    return new Date(nextReset.getTime() - GAME_TIMEZONE_OFFSET);
  }
  
  if (event.schedule.resetType === 'weekly') {
    const nextReset = new Date(gameNow);
    nextReset.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    const currentDay = gameNow.getDay();
    const targetDay = event.schedule.resetDay;
    let daysUntilReset = targetDay - currentDay;
    if (daysUntilReset < 0 || (daysUntilReset === 0 && gameNow >= nextReset)) daysUntilReset += 7;
    nextReset.setDate(nextReset.getDate() + daysUntilReset);
    return new Date(nextReset.getTime() - GAME_TIMEZONE_OFFSET);
  }
  
  if (event.schedule.resetType === 'biweekly') {
    const referenceDate = new Date('2025-01-01T04:00:00Z');
    const daysSinceReference = Math.floor((gameNow - referenceDate) / (24 * 60 * 60 * 1000));
    const daysSinceLastReset = daysSinceReference % 14;
    const daysUntilNextReset = 14 - daysSinceLastReset;
    const nextReset = new Date(gameNow);
    nextReset.setDate(nextReset.getDate() + daysUntilNextReset);
    nextReset.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    return new Date(nextReset.getTime() - GAME_TIMEZONE_OFFSET);
  }
  
  if (event.schedule.days) {
    const nextStart = new Date(gameNow);
    nextStart.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
    const currentDay = gameNow.getDay();
    const validDays = event.schedule.days;
    const eventEnd = new Date(nextStart.getTime() + event.schedule.durationHours * 60 * 60 * 1000);
    
    if (validDays.includes(currentDay) && gameNow >= nextStart && gameNow < eventEnd) {
      return { nextTime: new Date(eventEnd.getTime() - GAME_TIMEZONE_OFFSET), isActive: true };
    }
    
    for (let i = 0; i <= 7; i++) {
      const checkDate = new Date(gameNow);
      checkDate.setDate(checkDate.getDate() + i);
      const checkDay = checkDate.getDay();
      if (validDays.includes(checkDay)) {
        const eventStart = new Date(checkDate);
        eventStart.setHours(event.schedule.hour, event.schedule.minute, 0, 0);
        if (eventStart > gameNow || i > 0) {
          return { nextTime: new Date(eventStart.getTime() - GAME_TIMEZONE_OFFSET), isActive: false };
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

// ============ MAGICAL CREATURES UTILITIES ============
const MAGICAL_CREATURES = [
  { id: 'lovely_boarlet', name: 'Lovely Boarlet', type: 'magical-creature', icon: '🐗', description: 'A lovely boar creature', resetHours: [12, 16, 20], locations: ['Central Area'] },
  { id: 'breezy_boarlet', name: 'Breezy Boarlet', type: 'magical-creature', icon: '🌬️', description: 'A breezy boar creature', resetHours: [14, 18, 22], locations: ['Mountain Region'] },
  { id: 'loyal_boarlet', name: 'Loyal Boarlet', type: 'magical-creature', icon: '💙', description: 'A loyal boar creature', resetType: 'location-based', locations: ['Location 1', 'Location 2', 'Location 3', 'Location 4', 'Location 5', 'Location 6', 'Location 7', 'Location 8'] },
  { id: 'golden_nappo', name: 'Golden Nappo', type: 'magical-creature', icon: '⭐', description: 'A rare golden nappo', resetType: 'location-based', locations: ['Desert Area 1', 'Desert Area 2', 'Desert Area 3', 'Desert Area 4', 'Desert Area 5', 'Desert Area 6'] },
  { id: 'silver_nappo', name: 'Silver Nappo', type: 'magical-creature', icon: '🌙', description: 'A rare silver nappo', resetType: 'location-based', locations: ['Forest Area 1', 'Forest Area 2', 'Forest Area 3', 'Forest Area 4', 'Forest Area 5', 'Forest Area 6', 'Forest Area 7', 'Forest Area 8', 'Forest Area 9', 'Forest Area 10', 'Forest Area 11'] }
];

function getNextCreatureReset(creature) {
  if (!creature.resetHours) return null;
  const now = new Date();
  const gameNow = new Date(now.getTime() + GAME_TIMEZONE_OFFSET);
  const today = new Date(gameNow);
  today.setMinutes(0, 0, 0);
  
  for (const hour of creature.resetHours) {
    const resetTime = new Date(today);
    resetTime.setHours(hour);
    if (resetTime > gameNow) return new Date(resetTime.getTime() - GAME_TIMEZONE_OFFSET);
  }
  
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
  if (hours > 0) return `${hours}h ${minutes}m`;
  else if (minutes > 0) return `${minutes}m ${seconds}s`;
  else return `${seconds}s`;
}

// ============ MAIN RENDERER CODE ============
let bossData = [];
let subscribedBosses = new Set();
let searchQuery = '';
let showOnlySubscribed = false;
let eventTimerInterval = null;
let creatureTimerInterval = null;

// UI Elements (will be initialized on DOM ready)
let minimizeBtn, maximizeBtn, closeBtn, overlayBtn, overlayBtnText, refreshBtn;
let searchInput, showOnlySubscribedCheckbox, bossGrid, eventTimersGrid, magicalCreaturesGrid;
let connectionStatus, bossCount, lastUpdate;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing...');
  
  // Get UI elements
  minimizeBtn = document.getElementById('minimizeBtn');
  maximizeBtn = document.getElementById('maximizeBtn');
  closeBtn = document.getElementById('closeBtn');
  overlayBtn = document.getElementById('overlayBtn');
  overlayBtnText = document.getElementById('overlayBtnText');
  refreshBtn = document.getElementById('refreshBtn');
  searchInput = document.getElementById('searchInput');
  showOnlySubscribedCheckbox = document.getElementById('showOnlySubscribed');
  bossGrid = document.getElementById('bossGrid');
  eventTimersGrid = document.getElementById('eventTimersGrid');
  magicalCreaturesGrid = document.getElementById('magicalCreaturesGrid');
  connectionStatus = document.getElementById('connectionStatus');
  bossCount = document.getElementById('bossCount');
  lastUpdate = document.getElementById('lastUpdate');
  
  // Start initialization
  init();
});

async function init() {
  // Set up event listeners FIRST before anything else
  window.electronAPI.onBossDataLoaded(handleBossDataLoaded);
  window.electronAPI.onChannelDataLoaded(handleChannelDataLoaded);
  window.electronAPI.onChannelUpdate(handleChannelUpdate);
  window.electronAPI.onBossReset(handleBossReset);
  window.electronAPI.onConnected(handleConnected);
  window.electronAPI.onConnectionError(handleConnectionError);
  window.electronAPI.onShowNotification(showNotification);
  
  // Listen for realtime updates from sse-handler.js
  window.addEventListener('realtime-update', handleRealtimeUpdate);
  
  // Load subscribed bosses
  const subscribed = await window.electronAPI.getSubscribedBosses();
  subscribedBosses = new Set(subscribed);
  
  // Check overlay status
  const isOverlayActive = await window.electronAPI.getOverlayStatus();
  updateOverlayButton(isOverlayActive);

  // Set up UI event listeners
  minimizeBtn.addEventListener('click', () => window.electronAPI.windowMinimize());
  maximizeBtn.addEventListener('click', async () => {
    const isMaximized = await window.electronAPI.windowMaximize();
    maximizeBtn.textContent = isMaximized ? '❐' : '☐';
  });
  closeBtn.addEventListener('click', () => window.electronAPI.windowClose());
  
  overlayBtn.addEventListener('click', toggleOverlay);
  refreshBtn.addEventListener('click', refreshData);
  searchInput.addEventListener('input', handleSearchInput);
  showOnlySubscribedCheckbox.addEventListener('change', handleShowOnlySubscribedChange);
  
  // Show loading status
  updateConnectionStatus('Connecting...', 'connecting');
  
  // Request initial notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  // Initialize event timers and magical creatures (these don't need boss data)
  initEventTimers();
  initMagicalCreatures();
  
  // Request initial data from main process
  // This will trigger boss-data-loaded and channel-data-loaded events if data is ready
  console.log('Requesting initial data...');
  try {
    const result = await window.electronAPI.requestInitialData();
    console.log('Initial data request result:', result);
  } catch (error) {
    console.log('Error requesting initial data:', error);
  }
  
  // Auto-refresh disabled to prevent API rate limiting
  // The 30-second auto-refresh was loading 6100+ records every 30s which floods the API
  // We rely on SSE real-time updates instead
  // Uncomment below ONLY if SSE is not working:
  /*
  setInterval(() => {
    console.log('Auto-refresh triggered (30s interval)');
    window.electronAPI.requestInitialData();
  }, 30000);
  */
  
  // Connect to realtime SSE after a short delay (allow initial data to load first)
  setTimeout(async () => {
    console.log('⏰ setTimeout fired, calling connectRealtimeSSE...');
    try {
      await connectRealtimeSSE();
    } catch (error) {
      console.error('❌ Error calling connectRealtimeSSE:', error);
    }
  }, 1000);
}

function handleBossDataLoaded(bosses) {
  console.log('handleBossDataLoaded called with', bosses.length, 'items');
  bossData = bosses;
  updateConnectionStatus('Loading channel data...', 'connecting');
  renderBosses();
  renderMagicalCreatures(); // Also render magical creatures
}

function handleChannelDataLoaded() {
  console.log('Channel data loaded');
  updateConnectionStatus('Connected', 'connected');
  updateLastUpdateTime();
  renderBosses();
  renderMagicalCreatures(); // Also update magical creatures
}

function handleChannelUpdate(data) {
  console.log('Channel update:', data);
  updateLastUpdateTime();
  // Re-render just the affected boss
  renderBoss(data.bossId);
}

function handleRealtimeUpdate(event) {
  const data = event.detail;
  
  // Handle different collections/actions
  if (data.collection === 'mob_channel_status' && data.action === 'update') {
    // HP Update event
    const { mob, channel_number, last_hp, last_update } = data.record;
    updateLastUpdateTime();
    
    // Send to main process to update stored data
    window.electronAPI.updateChannelHP(mob, channel_number, last_hp, last_update)
      .then(() => renderBoss(mob))
      .catch(err => console.error('Error updating boss:', err));
    
  } else if (data.collection === 'mob_reset_events' && data.action === 'create') {
    // Boss Reset event
    const { mob } = data.record;
    showToast('Boss Respawned', `All channels have been reset to 100% HP`);
    renderBoss(mob);
    
  } else {
    console.log('Unhandled realtime update:', data);
  }
}

function handleBossReset(data) {
  console.log('Boss reset:', data.bossId);
  showToast('Boss Respawned', `All channels have been reset to 100% HP`);
  renderBoss(data.bossId);
}

function handleConnected() {
  console.log('SSE connected');
  updateConnectionStatus('Connected', 'connected');
}

function handleConnectionError(error) {
  console.error('Connection error:', error);
  updateConnectionStatus('Connection Error', 'error');
}

function updateConnectionStatus(text, status) {
  if (connectionStatus) {
    connectionStatus.textContent = text;
    connectionStatus.className = `connection-status ${status}`;
  }
}

function updateLastUpdateTime() {
  if (lastUpdate) {
    lastUpdate.textContent = new Date().toLocaleTimeString();
  }
}

async function toggleOverlay() {
  const isActive = await window.electronAPI.toggleOverlay();
  updateOverlayButton(isActive);
}

function updateOverlayButton(isActive) {
  if (isActive) {
    overlayBtnText.textContent = 'Hide Overlay';
    overlayBtn.classList.add('active');
  } else {
    overlayBtnText.textContent = 'Show Overlay';
    overlayBtn.classList.remove('active');
  }
}

async function refreshData() {
  updateConnectionStatus('Refreshing...', 'connecting');
  await window.electronAPI.refreshData();
}

function handleSearchInput(e) {
  searchQuery = e.target.value.toLowerCase();
  renderBosses();
}

function handleShowOnlySubscribedChange(e) {
  showOnlySubscribed = e.target.checked;
  renderBosses();
}

function renderBosses() {
  if (!bossData || bossData.length === 0) {
    bossGrid.innerHTML = '<div class="no-data">Loading bosses...</div>';
    return;
  }

  // Filter to only show bosses (not magical creatures)
  let filteredBosses = bossData.filter(mob => mob.type === 'boss');
  
  // Filter by search query
  if (searchQuery) {
    filteredBosses = filteredBosses.filter(boss => 
      boss.name.toLowerCase().includes(searchQuery)
    );
  }
  
  // Filter by subscription if checkbox is checked
  if (showOnlySubscribed) {
    filteredBosses = filteredBosses.filter(boss => 
      subscribedBosses.has(boss.id)
    );
  }

  if (filteredBosses.length === 0) {
    bossGrid.innerHTML = '<div class="no-data">No bosses found</div>';
    return;
  }

  // Update boss count
  if (bossCount) {
    bossCount.textContent = `${filteredBosses.length} Bosses`;
  }

  // Render all boss cards asynchronously
  Promise.all(filteredBosses.map(boss => renderBossCardAsync(boss))).then(cards => {
    bossGrid.innerHTML = cards.join('');
    
    // Add event listeners for subscription toggles
    filteredBosses.forEach(boss => {
      const subscribeBtn = document.getElementById(`subscribe-${boss.id}`);
      if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => toggleBossSubscription(boss.id));
      }
      
      const showChannelsBtn = document.getElementById(`show-channels-${boss.id}`);
      if (showChannelsBtn) {
        showChannelsBtn.addEventListener('click', () => toggleChannelDetails(boss.id));
      }
    });
  });
}

async function renderBoss(bossId) {
  const boss = bossData.find(b => b.id === bossId);
  if (!boss) return;
  
  const bossCard = document.getElementById(`boss-card-${bossId}`);
  if (bossCard) {
    // Check if channel details are currently open
    const channelDetails = document.getElementById(`channel-details-${bossId}`);
    const wasOpen = channelDetails && !channelDetails.classList.contains('hidden');
    
    // If channel details are open, only update the stats and preview pills (not the full grid)
    if (wasOpen) {
      // Update only the stats section and preview pills without re-rendering channel grid
      await updateBossCardStats(boss, bossId);
    } else {
      // Channel details are closed, do a full re-render
      const newCardHTML = await renderBossCardAsync(boss);
      const newCard = document.createElement('div');
      newCard.innerHTML = newCardHTML;
      bossCard.replaceWith(newCard.firstElementChild);
      
      // Re-add event listeners
      const subscribeBtn = document.getElementById(`subscribe-${boss.id}`);
      if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => toggleBossSubscription(boss.id));
      }
      
      const showChannelsBtn = document.getElementById(`show-channels-${boss.id}`);
      if (showChannelsBtn) {
        showChannelsBtn.addEventListener('click', () => toggleChannelDetails(boss.id));
      }
    }
  }
}

// Update only the stats and preview pills without re-rendering the entire card
async function updateBossCardStats(boss, bossId) {
  const channels = await window.electronAPI.getBossChannels(bossId) || [];
  
  const aliveChannels = channels.filter(ch => ch.status === 'alive' && ch.hp > 0);
  const deadChannels = channels.filter(ch => ch.status === 'dead');
  
  // Update stat values
  const statsContainer = document.querySelector(`#boss-card-${bossId} .channel-stats`);
  if (statsContainer) {
    const aliveValue = statsContainer.querySelector('.stat-alive .stat-value');
    const deadValue = statsContainer.querySelector('.stat-dead .stat-value');
    if (aliveValue) aliveValue.textContent = aliveChannels.length;
    if (deadValue) deadValue.textContent = deadChannels.length;
  }
  
  // Update preview pills
  const previewContainer = document.querySelector(`#boss-card-${bossId} .channel-pills-preview`);
  if (previewContainer) {
    const topAliveChannels = aliveChannels.sort((a, b) => a.hp - b.hp).slice(0, 15);
    
    const previewHTML = topAliveChannels.map(ch => {
      const statusClass = getChannelClass(ch.hp);
      return `
        <div class="channel-pill-container-small" title="Channel ${ch.channelNumber}: ${ch.hp}% HP">
          <div class="channel-pill-number-small">${ch.channelNumber}</div>
          <div class="channel-pill-bar-small">
            <div class="channel-pill-progress ${statusClass}" style="width: ${ch.hp}%"></div>
          </div>
        </div>
      `;
    }).join('') + (aliveChannels.length > 15 ? `<div class="channel-pill-more">+${aliveChannels.length - 15}</div>` : '');
    
    previewContainer.innerHTML = previewHTML;
  }
  
  // IMPORTANT: Also update the channel grid if it's currently open!
  const channelDetails = document.querySelector(`#channel-details-${bossId}`);
  if (channelDetails && !channelDetails.classList.contains('hidden')) {
    const channelGrid = channelDetails.querySelector('.channel-grid');
    if (channelGrid) {
      // Get all channel pill containers
      const channelElements = channelGrid.querySelectorAll('.channel-pill-container');
      
      // Update each channel element
      channelElements.forEach((element, index) => {
        const channelNumber = index + 1; // Channels are 1-indexed
        const channelData = channels.find(ch => ch.channelNumber === channelNumber);
        
        if (channelData) {
          const hpBar = element.querySelector('.channel-pill-progress');
          const isUnknown = channelData.status === 'unknown';
          const isDead = !isUnknown && channelData.hp === 0;
          const hp = isUnknown ? 0 : channelData.hp;
          const statusClass = getChannelClass(hp);
          const barWidth = isUnknown ? 0 : (isDead ? 100 : hp);
          
          if (hpBar) {
            hpBar.className = `channel-pill-progress ${statusClass}${isUnknown ? ' unknown' : ''}`;
            hpBar.style.width = `${barWidth}%`;
          }
          
          // Update tooltip
          element.title = `Channel ${channelNumber}: ${isUnknown ? 'Unknown Status' : hp + '% HP'}`;
        }
      });
    }
  }
}

async function renderBossCardAsync(boss) {
  const isSubscribed = subscribedBosses.has(boss.id);
  const channels = await window.electronAPI.getBossChannels(boss.id) || [];
  
  // Count alive channels
  const aliveChannels = channels.filter(ch => ch.status === 'alive' && ch.hp > 0);
  const deadChannels = channels.filter(ch => ch.status === 'dead');
  const totalChannels = boss.totalChannels || 50;
  
  // Get top alive channels sorted by HP
  const topAliveChannels = aliveChannels
    .sort((a, b) => a.hp - b.hp)
    .slice(0, 15); // Show top 15 alive channels
  
  // Get boss image path
  const bossImagePath = getBossImagePath(boss.name, boss.type || 'boss');
  
  return `
    <div class="boss-card ${isSubscribed ? 'subscribed' : ''}" id="boss-card-${boss.id}">
      <div class="boss-header">
        <div class="boss-avatar">
          <img src="${bossImagePath}" alt="${boss.name}" onerror="this.style.display='none'">
        </div>
        <div class="boss-info">
          <h3 class="boss-name">${boss.name}</h3>
          <div class="boss-map">${boss.map?.name || 'Unknown Map'}</div>
        </div>
        <button class="subscribe-btn ${isSubscribed ? 'subscribed' : ''}" id="subscribe-${boss.id}" title="${isSubscribed ? 'Unsubscribe' : 'Subscribe for notifications'}">
          ${isSubscribed ? '★' : '☆'}
        </button>
      </div>
      
      <div class="channel-stats">
        <div class="stat stat-alive">
          <span class="stat-label">Alive</span>
          <span class="stat-value">${aliveChannels.length}</span>
        </div>
        <div class="stat stat-dead">
          <span class="stat-label">Dead</span>
          <span class="stat-value">${deadChannels.length}</span>
        </div>
        <div class="stat stat-total">
          <span class="stat-label">Total</span>
          <span class="stat-value">${totalChannels}</span>
        </div>
      </div>
      
      ${topAliveChannels.length > 0 ? `
        <div class="channel-pills-preview">
          ${topAliveChannels.map(ch => {
            const statusClass = getChannelClass(ch.hp);
            return `
            <div class="channel-pill-container-small" title="Channel ${ch.channelNumber}: ${ch.hp}% HP">
              <div class="channel-pill-number-small">${ch.channelNumber}</div>
              <div class="channel-pill-bar-small">
                <div class="channel-pill-progress ${statusClass}" style="width: ${ch.hp}%"></div>
              </div>
            </div>
          `;
          }).join('')}
          ${aliveChannels.length > 15 ? `<div class="channel-pill-more">+${aliveChannels.length - 15}</div>` : ''}
        </div>
      ` : '<div class="no-alive-channels">No alive channels</div>'}
      
      <button class="show-channels-btn" id="show-channels-${boss.id}" onclick="event.stopPropagation()">
        Show All Channels
      </button>
      
      <div class="channel-details hidden" id="channel-details-${boss.id}" onclick="event.stopPropagation()">
        <div class="channel-grid">
          ${renderAllChannels(boss.id, channels, totalChannels)}
        </div>
      </div>
    </div>
  `;
}

function renderAllChannels(bossId, channels, totalChannels) {
  const channelMap = new Map(channels.map(ch => [ch.channelNumber, ch]));
  const allChannels = [];
  
  for (let i = 1; i <= totalChannels; i++) {
    const ch = channelMap.get(i) || { channelNumber: i, hp: 100, status: 'unknown' };
    allChannels.push(ch);
  }
  
  return allChannels.map(ch => {
    const isUnknown = ch.status === 'unknown';
    const isDead = !isUnknown && ch.hp === 0;
    const hp = isUnknown ? 0 : ch.hp;
    const statusClass = getChannelClass(hp);
    
    // Dead channels (0% HP) show full red bar, unknown show empty dark bar
    const barWidth = isUnknown ? 0 : (isDead ? 100 : hp);
    
    return `
    <div class="channel-pill-container" onclick="event.stopPropagation()" 
         title="Channel ${ch.channelNumber}: ${isUnknown ? 'Unknown Status' : hp + '% HP'}">
      <div class="channel-pill-number">${ch.channelNumber}</div>
      <div class="channel-pill-bar">
        <div class="channel-pill-progress ${statusClass} ${isUnknown ? 'unknown' : ''}" 
             style="width: ${barWidth}%">
        </div>
      </div>
    </div>
  `;
  }).join('');
}

function getChannelClass(hp) {
  if (hp === 0) return 'dead';
  if (hp < 30) return 'critical';
  if (hp < 60) return 'low';
  return 'healthy';
}

function toggleChannelDetails(bossId) {
  const details = document.getElementById(`channel-details-${bossId}`);
  const btn = document.getElementById(`show-channels-${bossId}`);
  
  if (details && btn) {
    details.classList.toggle('hidden');
    btn.textContent = details.classList.contains('hidden') ? 'Show All Channels' : 'Hide Channels';
  }
}

async function toggleBossSubscription(bossId) {
  const isSubscribed = subscribedBosses.has(bossId);
  
  if (isSubscribed) {
    subscribedBosses.delete(bossId);
    showToast('Unsubscribed', `You will no longer receive notifications for this boss`);
  } else {
    subscribedBosses.add(bossId);
    showToast('Subscribed', `You will receive notifications when channels are low HP`);
  }
  
  // Update in main process
  await window.electronAPI.toggleBossSubscription(bossId);
  
  // Re-render the boss card
  renderBoss(bossId);
}

function showNotification(data) {
  // Use browser notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(data.title, {
      body: data.body,
      icon: '../../../assets/icon.png'
    });
  }
  
  // Also show in-app toast
  showToast(data.title, data.body);
}

function showToast(title, message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-message">${message}</div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Helper function to convert text to snake_case
function toSnakeCase(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Helper function to get boss image path from bptimer.com CDN
function getBossImagePath(bossName, mobType = 'boss') {
  if (!bossName) return '';
  
  const imageName = toSnakeCase(bossName);
  const folder = mobType === 'boss' ? 'bosses' : 'magical-creatures';
  
  // Load images directly from bptimer.com CDN
  return `https://bptimer.com/images/${folder}/${imageName}.webp`;
}

// Event Timer Functions
function initEventTimers() {
  renderEventTimers();
  
  // Update every second
  if (eventTimerInterval) {
    clearInterval(eventTimerInterval);
  }
  
  eventTimerInterval = setInterval(() => {
    updateEventTimers();
  }, 1000);
}

function renderEventTimers() {
  const html = EVENT_CONFIGS.map(event => {
    const eventTime = getNextEventTime(event);
    const isActive = eventTime.isActive || false;
    const nextTime = eventTime.nextTime || eventTime;
    const timeUntil = nextTime - new Date();
    
    return `
      <div class="event-timer-card ${isActive ? 'active' : ''}" data-event-id="${event.id}">
        <div class="event-timer-header">
          <span class="event-icon">${event.icon}</span>
          <div>
            <h3 class="event-name">${event.name}</h3>
            <span class="event-status ${isActive ? 'active' : 'upcoming'}">
              ${isActive ? 'ACTIVE' : 'UPCOMING'}
            </span>
          </div>
        </div>
        <div class="event-countdown">
          <div class="countdown-label">${isActive ? 'Ends in' : 'Starts in'}</div>
          <div class="countdown-time" data-time="${nextTime.getTime()}">
            ${formatCountdown(timeUntil)}
          </div>
        </div>
        ${isActive && event.schedule.durationHours ? `
          <div class="event-progress">
            <div class="event-progress-bar" style="width: 0%"></div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  
  eventTimersGrid.innerHTML = html;
}

function updateEventTimers() {
  EVENT_CONFIGS.forEach(event => {
    const card = document.querySelector(`[data-event-id="${event.id}"]`);
    if (!card) return;
    
    const eventTime = getNextEventTime(event);
    const isActive = eventTime.isActive || false;
    const nextTime = eventTime.nextTime || eventTime;
    const now = new Date();
    const timeUntil = nextTime - now;
    
    // Update card state
    const wasActive = card.classList.contains('active');
    if (isActive !== wasActive) {
      card.classList.toggle('active', isActive);
      
      const statusEl = card.querySelector('.event-status');
      statusEl.textContent = isActive ? 'ACTIVE' : 'UPCOMING';
      statusEl.classList.toggle('active', isActive);
      statusEl.classList.toggle('upcoming', !isActive);
      
      const labelEl = card.querySelector('.countdown-label');
      labelEl.textContent = isActive ? 'Ends in' : 'Starts in';
    }
    
    // Update countdown
    const countdownEl = card.querySelector('.countdown-time');
    if (countdownEl) {
      countdownEl.textContent = formatCountdown(Math.max(0, timeUntil));
    }
    
    // Update progress bar for active events
    if (isActive && event.schedule.durationHours) {
      const progressBar = card.querySelector('.event-progress-bar');
      if (progressBar) {
        const durationMs = event.schedule.durationHours * 60 * 60 * 1000;
        const elapsed = durationMs - timeUntil;
        const progress = Math.min(100, Math.max(0, (elapsed / durationMs) * 100));
        progressBar.style.width = `${progress}%`;
      }
    }
    
    // Refresh if countdown expired
    if (timeUntil <= 0 && !isActive) {
      setTimeout(() => renderEventTimers(), 1000);
    }
  });
}

// Magical Creatures Functions
function initMagicalCreatures() {
  renderMagicalCreatures();
}

async function renderMagicalCreatures() {
  // Get magical creatures from bossData (check both underscore and hyphen formats)
  const creatures = bossData.filter(m => m.type === 'magical_creature' || m.type === 'magical-creature');
  
  console.log('Rendering magical creatures:', creatures.length, 'found');
  
  if (creatures.length === 0) {
    magicalCreaturesGrid.innerHTML = `
      <div class="loading-state">
        <p>No magical creatures found</p>
      </div>
    `;
    return;
  }
  
  // Render all creature cards asynchronously
  const cards = await Promise.all(creatures.map(creature => renderCreatureCardAsync(creature)));
  magicalCreaturesGrid.innerHTML = cards.join('');
  
  // Add event listeners for subscribe and show channels buttons
  creatures.forEach(creature => {
    const subscribeBtn = document.getElementById(`subscribe-${creature.id}`);
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', () => toggleBossSubscription(creature.id));
    }
    
    const showChannelsBtn = document.getElementById(`show-channels-${creature.id}`);
    if (showChannelsBtn) {
      showChannelsBtn.addEventListener('click', () => toggleChannelDetails(creature.id));
    }
  });
}

async function renderCreatureCardAsync(creature) {
  const isSubscribed = subscribedBosses.has(creature.id);
  const channels = await window.electronAPI.getBossChannels(creature.id) || [];
  
  // Count alive channels - magical creatures have 200 channels, bosses have 50
  const aliveChannels = channels.filter(ch => ch.status === 'alive' && ch.hp > 0);
  const deadChannels = channels.filter(ch => ch.status === 'dead' || ch.hp === 0);
  const totalChannels = creature.totalChannels || 200; // Magical creatures have 200 channels
  
  // Get top alive channels sorted by HP (or show dead ones if no alive)
  const topAliveChannels = aliveChannels
    .sort((a, b) => a.hp - b.hp)
    .slice(0, 15); // Show top 15 alive channels
  
  // Get creature image path
  const creatureImagePath = getBossImagePath(creature.name, 'magical-creature');
  
  return `
    <div class="boss-card ${isSubscribed ? 'subscribed' : ''}" id="boss-card-${creature.id}">
      <div class="boss-header">
        <div class="boss-avatar">
          <img src="${creatureImagePath}" alt="${creature.name}" onerror="this.style.display='none'">
        </div>
        <div class="boss-info">
          <h3 class="boss-name">${creature.name}</h3>
          <div class="boss-map">${creature.map?.name || 'Unknown Map'}</div>
        </div>
        <button class="subscribe-btn ${isSubscribed ? 'subscribed' : ''}" id="subscribe-${creature.id}" title="${isSubscribed ? 'Unsubscribe' : 'Subscribe for notifications'}">
          ${isSubscribed ? '★' : '☆'}
        </button>
      </div>
      
      <div class="channel-stats">
        <div class="stat stat-alive">
          <span class="stat-label">Alive</span>
          <span class="stat-value">${aliveChannels.length}</span>
        </div>
        <div class="stat stat-dead">
          <span class="stat-label">Dead</span>
          <span class="stat-value">${deadChannels.length}</span>
        </div>
        <div class="stat stat-total">
          <span class="stat-label">Total</span>
          <span class="stat-value">${totalChannels}</span>
        </div>
      </div>
      
      ${topAliveChannels.length > 0 ? `
        <div class="top-alive-channels">
          <div class="channel-pills-preview">
          ${topAliveChannels.map(ch => {
            const statusClass = getChannelClass(ch.hp);
            return `
            <div class="channel-pill-container-small" 
                 onclick="event.stopPropagation()"
                 title="Channel ${ch.channelNumber}: ${ch.hp}% HP">
              <div class="channel-pill-number-small">${ch.channelNumber}</div>
              <div class="channel-pill-bar-small">
                <div class="channel-pill-progress ${statusClass}" style="width: ${ch.hp}%"></div>
              </div>
            </div>
          `;
          }).join('')}
          ${aliveChannels.length > 15 ? `<div class="channel-pill-more">+${aliveChannels.length - 15}</div>` : ''}
        </div>
      </div>
      ` : '<div class="no-alive-channels">All channels dead (0% HP)</div>'}
      
      <button class="show-channels-btn" id="show-channels-${creature.id}" onclick="event.stopPropagation()">
        Show All Channels
      </button>
      
      <div class="channel-details hidden" id="channel-details-${creature.id}" onclick="event.stopPropagation()">
        <div class="channel-grid">
          ${renderAllChannels(creature.id, channels, totalChannels)}
        </div>
      </div>
    </div>
  `;
}

function updateMagicalCreatures() {
  // Re-render magical creatures when data updates
  renderMagicalCreatures();
}

async function renderCreature(creatureId) {
  const creature = bossData.find(c => c.id === creatureId && (c.type === 'magical_creature' || c.type === 'magical-creature'));
  if (!creature) return;
  
  const creatureCard = document.getElementById(`boss-card-${creatureId}`);
  if (creatureCard) {
    // Check if channel details are currently open
    const channelDetails = document.getElementById(`channel-details-${creatureId}`);
    const wasOpen = channelDetails && !channelDetails.classList.contains('hidden');
    const scrollTop = channelDetails ? channelDetails.scrollTop : 0;
    
    // If channel details are open, only update the stats and preview pills
    if (wasOpen) {
      await updateCreatureCardStats(creature, creatureId);
    } else {
      // Channel details are closed, do a full re-render
      const newCardHTML = await renderCreatureCardAsync(creature);
      const newCard = document.createElement('div');
      newCard.innerHTML = newCardHTML;
      creatureCard.replaceWith(newCard.firstElementChild);
      
      // Re-add event listeners
      const subscribeBtn = document.getElementById(`subscribe-${creature.id}`);
      if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => toggleBossSubscription(creature.id));
      }
      
      const showChannelsBtn = document.getElementById(`show-channels-${creature.id}`);
      if (showChannelsBtn) {
        showChannelsBtn.addEventListener('click', () => toggleChannelDetails(creature.id));
      }
    }
  }
}

// Update only the stats and preview pills for magical creatures
async function updateCreatureCardStats(creature, creatureId) {
  const channels = await window.electronAPI.getBossChannels(creatureId) || [];
  const aliveChannels = channels.filter(ch => ch.status === 'alive' && ch.hp > 0);
  const deadChannels = channels.filter(ch => ch.status === 'dead');
  
  // Update stat values
  const statsContainer = document.querySelector(`#boss-card-${creatureId} .channel-stats`);
  if (statsContainer) {
    const aliveValue = statsContainer.querySelector('.stat-alive .stat-value');
    const deadValue = statsContainer.querySelector('.stat-dead .stat-value');
    if (aliveValue) aliveValue.textContent = aliveChannels.length;
    if (deadValue) deadValue.textContent = deadChannels.length;
  }
  
  // Update preview pills
  const previewContainer = document.querySelector(`#boss-card-${creatureId} .channel-pills-preview`);
  if (previewContainer) {
    const topAliveChannels = aliveChannels.sort((a, b) => a.hp - b.hp).slice(0, 15);
    
    const previewHTML = topAliveChannels.map(ch => {
      const statusClass = getChannelClass(ch.hp);
      return `
        <div class="channel-pill-container-small" 
             onclick="event.stopPropagation()"
             title="Channel ${ch.channelNumber}: ${ch.hp}% HP">
          <div class="channel-pill-number-small">${ch.channelNumber}</div>
          <div class="channel-pill-bar-small">
            <div class="channel-pill-progress ${statusClass}" style="width: ${ch.hp}%"></div>
          </div>
        </div>
      `;
    }).join('') + (aliveChannels.length > 15 ? `<div class="channel-pill-more">+${aliveChannels.length - 15}</div>` : '');
    
    previewContainer.innerHTML = previewHTML;
  }
}

// Toggle locations dropdown (not used anymore but kept for compatibility)
window.toggleLocations = function(creatureId) {
  const locationsList = document.getElementById(`locations-${creatureId}`);
  const arrow = document.getElementById(`arrow-${creatureId}`);
  
  if (locationsList && arrow) {
    locationsList.classList.toggle('show');
    arrow.classList.toggle('open');
  }
};

// Clean up on window close
window.addEventListener('beforeunload', () => {
  if (eventTimerInterval) {
    clearInterval(eventTimerInterval);
  }
  if (creatureTimerInterval) {
    clearInterval(creatureTimerInterval);
  }
});

// ============ REALTIME SSE CONNECTION ============
let eventSource = null;
let sseAbortController = null;

async function connectRealtimeSSE() {
  try {
    console.log('🔌 Connecting to PocketBase realtime SSE using fetch + ReadableStream...');
    
    // Abort any existing connection
    if (sseAbortController) {
      sseAbortController.abort();
    }
    
    sseAbortController = new AbortController();
    const realtimeURL = 'https://db.bptimer.com/api/realtime';
    
    console.log('📍 About to fetch:', realtimeURL);
    
    const response = await fetch(realtimeURL, {
      signal: sseAbortController.signal,
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('✓ SSE Connection established via fetch');
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    console.log('🔄 Starting to read SSE stream...');
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('SSE stream ended');
        break;
      }
      
      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      let eventType = '';
      let eventData = '';
      
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          eventData = line.substring(5).trim();
        } else if (line === '') {
          // Empty line means end of event
          if (eventData) {
            console.log(`📨 SSE Event received - Type: "${eventType}", Data:`, eventData);
            handleSSEMessage(eventType, eventData);
            eventType = '';
            eventData = '';
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ SSE fetch error:', error);
    if (error.name === 'AbortError') {
      console.log('SSE connection aborted');
    } else {
      // Reconnect after 5 seconds
      console.log('🔄 Will reconnect in 5 seconds...');
      setTimeout(() => connectRealtimeSSE(), 5000);
    }
  }
}

function handleSSEMessage(eventType, dataString) {
  try {
    const data = JSON.parse(dataString);
    
    // Handle PB_CONNECT
    if (eventType === 'PB_CONNECT' || data.clientId) {
      console.log('✓ PB_CONNECT received with clientId:', data.clientId);
      subscribeToCollections(data.clientId);
      return;
    }
    
    // NEW FORMAT: Event type is in the eventType parameter, data is the parsed array/object
    // Example: eventType = "mob_hp_updates", data = ["mobId", 42, 10]
    if (eventType && eventType !== '') {
      // Access the centralized config
      const { EVENT_HANDLERS } = window.API_CONFIG || {};
      
      if (EVENT_HANDLERS && EVENT_HANDLERS[eventType]) {
        // Use the handler's parse function - pass the already-parsed data
        const parsedData = EVENT_HANDLERS[eventType].parse(data);
        
        if (parsedData) {
          // Check if parsedData is an array (multi-dimensional updates)
          if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].action) {
            // Multiple updates - dispatch each one
            parsedData.forEach(update => {
              window.dispatchEvent(new CustomEvent('realtime-update', { 
                detail: update
              }));
            });
          } else {
            // Single update - dispatch as before
            window.dispatchEvent(new CustomEvent('realtime-update', { 
              detail: parsedData
            }));
          }
        }
      }
      return;
    }
    
    // OLD FORMAT: Handle collection events (backwards compatibility)
    if (data.action && data.record) {
      console.log(`📡 Old format collection event: ${data.record.collectionName} - ${data.action}`);
      handleRealtimeSSEEvent(data);
    }
  } catch (error) {
    console.error('Error parsing SSE message:', error, 'Data:', dataString);
  }
}

async function connectRealtimeSSE() {
  try {
    console.log('🔌 Connecting to PocketBase realtime SSE using fetch + ReadableStream...');
    
    // Abort any existing connection
    if (sseAbortController) {
      sseAbortController.abort();
    }
    
    sseAbortController = new AbortController();
    const realtimeURL = 'https://db.bptimer.com/api/realtime';
    
    console.log('📍 About to fetch:', realtimeURL);
    
    const response = await fetch(realtimeURL, {
      signal: sseAbortController.signal,
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('✓ SSE Connection established via fetch');
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    console.log('🔄 Starting to read SSE stream...');
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('SSE stream ended');
        break;
      }
      
      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      let eventType = '';
      let eventData = '';
      
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.substring(6).trim();
        } else if (line.startsWith('data:')) {
          eventData = line.substring(5).trim();
        } else if (line === '') {
          // Empty line means end of event
          if (eventData) {
            console.log(`📨 SSE Event received - Type: "${eventType}", Data:`, eventData);
            handleSSEMessage(eventType, eventData);
            eventType = '';
            eventData = '';
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ SSE fetch error:', error);
    if (error.name === 'AbortError') {
      console.log('SSE connection aborted');
    } else {
      // Reconnect after 5 seconds
      console.log('🔄 Will reconnect in 5 seconds...');
      setTimeout(() => connectRealtimeSSE(), 5000);
    }
  }
}

function subscribeToCollections(clientId) {
  const subscriptions = [
   // 'mobs/*',
   // 'mob_channel_status_sse/*',
   // 'mob_reset_events/*'
   "mob_hp_updates", "mob_resets"
  ];
  
  console.log('📤 Sending subscription POST with clientId:', clientId);
  console.log('📤 Subscriptions:', subscriptions);
  
  fetch('https://db.bptimer.com/api/realtime', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientId: clientId,
      subscriptions: subscriptions
    })
  })
  .then(res => {
    console.log('✓ Subscription response status:', res.status);
    console.log('✓ Subscription response headers:', Object.fromEntries(res.headers.entries()));
    return res.text();
  })
  .then(data => {
    console.log('✓ Subscription confirmed, response body:', data);
    console.log('🎧 Now listening for events on subscribed collections...');
    console.log('⚠️ KEEP the original EventSource connection open - do NOT reconnect!');
  })
  .catch(error => {
    console.error('❌ Subscription error:', error);
  });
}

function handleRealtimeSSEEvent(data) {
  if (!data || !data.action || !data.record) {
    return;
  }
  
  const collection = data.record.collectionName;
  const { action, record } = data;
  
  console.log(`📡 Realtime event: ${collection} - ${action}`, record);
  
  // Handle mob_channel_status_sse updates (HP changes)
  if (collection === 'mob_channel_status_sse') {
    const { mob, channel_number, last_hp, last_update } = record;
    console.log(`🎯 Channel update: Boss ${mob}, Channel ${channel_number}, HP ${last_hp}%`);
    
    const entity = bossData.find(b => b.id === mob);
    if (entity) {
      // Update the channel data in-memory (efficient - no API call!)
      window.electronAPI.updateChannelHP(mob, channel_number, last_hp, last_update);
      
      // Check if channel details are open - if so, update only that specific channel pill
      const channelDetails = document.getElementById(`channel-details-${mob}`);
      const isOpen = channelDetails && !channelDetails.classList.contains('hidden');
      
      if (isOpen) {
        // Update only the specific channel pill (no flicker!)
        updateSingleChannelPill(mob, channel_number, last_hp);
      }
      
      // Re-render the card (for stats and preview pills)
      if (entity.type === 'magical_creature' || entity.type === 'magical-creature') {
        renderCreature(mob);
      } else {
        renderBoss(mob);
      }
      
      // Show notification if this is a subscribed entity with low HP
      const isSubscribed = subscribedBosses.has(mob);
      if (isSubscribed && last_hp < 30 && last_hp > 0) {
        showToast(`${entity.name} - Channel ${channel_number}`, `HP: ${last_hp}% (Critical!)`);
      }
    }
  }
  
  // Handle boss data updates
  if (collection === 'mobs') {
    console.log('🔄 Boss data updated, refreshing...');
    window.electronAPI.requestInitialData();
  }
  
  // Handle reset events
  if (collection === 'mob_reset_events') {
    const { mob, channel } = record;
    const boss = bossData.find(b => b.id === mob);
    if (boss) {
      console.log(`🔔 Boss reset: ${boss.name} - Channel ${channel}`);
      const isSubscribed = subscribedBosses.has(mob);
      if (isSubscribed) {
        showToast(`${boss.name} Respawned!`, `Channel ${channel} has been reset`);
      }
      // Update just this boss
      window.electronAPI.updateChannelHP(mob, channel, 100, new Date().toISOString());
      renderBoss(mob);
    }
  }
}

// Update a single channel pill without re-rendering the entire grid (prevents flicker)
function updateSingleChannelPill(bossId, channelNumber, hp) {
  const channelDetails = document.getElementById(`channel-details-${bossId}`);
  if (!channelDetails) return;
  
  // Find all channel containers in the grid
  const containers = channelDetails.querySelectorAll('.channel-pill-container');
  
  containers.forEach(container => {
    const numberEl = container.querySelector('.channel-pill-number');
    if (numberEl && parseInt(numberEl.textContent) === channelNumber) {
      // Found the channel pill to update
      const progressBar = container.querySelector('.channel-pill-progress');
      if (progressBar) {
        const isDead = hp === 0;
        const barWidth = isDead ? 100 : hp;
        const statusClass = getChannelClass(hp);
        
        // Update the progress bar width and class
        progressBar.style.width = `${barWidth}%`;
        progressBar.className = `channel-pill-progress ${statusClass}`;
        
        // Update tooltip
        container.title = `Channel ${channelNumber}: ${hp}% HP`;
      }
    }
  });
}

// ============ AUTO-UPDATE FUNCTIONALITY ============

// UI Elements
const versionInfo = document.getElementById('versionInfo');
const checkUpdateBtn = document.getElementById('checkUpdateBtn');
const updateNotification = document.getElementById('updateNotification');
const closeUpdateNotification = document.getElementById('closeUpdateNotification');
const updateTitle = document.getElementById('updateTitle');
const updateMessage = document.getElementById('updateMessage');
const updateProgress = document.getElementById('updateProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// Load and display app version
async function loadAppVersion() {
  try {
    const version = await window.electronAPI.getAppVersion();
    if (versionInfo) {
      versionInfo.textContent = `v${version}`;
    }
  } catch (error) {
    console.error('Error loading app version:', error);
  }
}

// Show update notification
function showUpdateNotification(title, message, showProgress = false) {
  if (updateNotification) {
    updateTitle.textContent = title;
    updateMessage.textContent = message;
    updateProgress.classList.toggle('hidden', !showProgress);
    updateNotification.classList.remove('hidden');
  }
}

// Hide update notification
function hideUpdateNotification() {
  if (updateNotification) {
    updateNotification.classList.add('hidden');
  }
}

// Update progress bar
function setUpdateProgress(percent) {
  if (progressFill && progressText) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
  }
}

// Event Listeners
if (checkUpdateBtn) {
  checkUpdateBtn.addEventListener('click', async () => {
    try {
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  });
}

if (closeUpdateNotification) {
  closeUpdateNotification.addEventListener('click', hideUpdateNotification);
}

// Listen for update events
window.electronAPI.onUpdateAvailable((info) => {
  console.log('Update available:', info);
  showUpdateNotification(
    'Update Available',
    `Version ${info.version} is available. Click to download.`,
    false
  );
});

window.electronAPI.onUpdateDownloading(() => {
  console.log('Update downloading...');
  showUpdateNotification(
    'Downloading Update',
    'Downloading the latest version...',
    true
  );
  setUpdateProgress(0);
});

window.electronAPI.onUpdateDownloadProgress((progressInfo) => {
  console.log('Download progress:', progressInfo.percent);
  setUpdateProgress(progressInfo.percent);
  updateMessage.textContent = `Downloading... ${progressInfo.percent}%`;
});

window.electronAPI.onUpdateDownloaded((info) => {
  console.log('Update downloaded:', info);
  showUpdateNotification(
    'Update Ready',
    `Version ${info.version} has been downloaded. Restart to install.`,
    false
  );
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    hideUpdateNotification();
  }, 10000);
});

window.electronAPI.onUpdateError((error) => {
  console.error('Update error:', error);
  showUpdateNotification(
    'Update Error',
    `Failed to update: ${error.message}`,
    false
  );
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideUpdateNotification();
  }, 5000);
});

// Initialize version display
loadAppVersion();



