// Main window renderer
let bossData = [];
let channelStatusMap = new Map();
let subscribedBosses = new Set();
let currentFilter = 'all';
let searchQuery = '';
let showOnlySubscribed = false;

// UI Elements
const minimizeBtn = document.getElementById('minimizeBtn');
const maximizeBtn = document.getElementById('maximizeBtn');
const closeBtn = document.getElementById('closeBtn');
const overlayBtn = document.getElementById('overlayBtn');
const overlayBtnText = document.getElementById('overlayBtnText');
const refreshBtn = document.getElementById('refreshBtn');
const mapFilter = document.getElementById('mapFilter');
const searchInput = document.getElementById('searchInput');
const showOnlySubscribedCheckbox = document.getElementById('showOnlySubscribed');
const bossGrid = document.getElementById('bossGrid');
const activeTimers = document.getElementById('activeTimers');
const connectionStatus = document.getElementById('connectionStatus');
const bossCount = document.getElementById('bossCount');
const lastUpdate = document.getElementById('lastUpdate');

// Initialize
init();

async function init() {
  // Load subscribed bosses
  const subscribed = await window.electronAPI.getSubscribedBosses();
  subscribedBosses = new Set(subscribed);
  
  // Check overlay status
  const isOverlayActive = await window.electronAPI.getOverlayStatus();
  updateOverlayButton(isOverlayActive);

  // Set up event listeners
  minimizeBtn.addEventListener('click', () => window.electronAPI.windowMinimize());
  maximizeBtn.addEventListener('click', async () => {
    const isMaximized = await window.electronAPI.windowMaximize();
    maximizeBtn.textContent = isMaximized ? '❐' : '☐';
  });
  closeBtn.addEventListener('click', () => window.electronAPI.windowClose());
  
  overlayBtn.addEventListener('click', toggleOverlay);
  refreshBtn.addEventListener('click', refreshData);
  mapFilter.addEventListener('change', handleFilterChange);
  searchInput.addEventListener('input', handleSearchInput);
  showOnlySubscribedCheckbox.addEventListener('change', (e) => {
    showOnlySubscribed = e.target.checked;
    renderBosses();
  });

  // Listen for data updates
  window.electronAPI.onBossData(handleBossData);
  window.electronAPI.onChannelStatusUpdate(handleChannelStatusUpdate);
  window.electronAPI.onResetEvent(handleResetEvent);
  window.electronAPI.onShowNotification(showNotification);

  // Update timers every second
  setInterval(updateActiveTimers, 1000);
}

function showNotification(data) {
  // Use browser notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(data.title, {
      body: data.body,
      icon: '../../../assets/icon.png'
    });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(data.title, {
          body: data.body,
          icon: '../../../assets/icon.png'
        });
      }
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

async function toggleBossSubscription(bossId) {
  const isSubscribed = await window.electronAPI.toggleBossSubscription(bossId);
  
  if (isSubscribed) {
    subscribedBosses.add(bossId);
  } else {
    subscribedBosses.delete(bossId);
  }
  
  renderBosses();
  return isSubscribed;
}

async function toggleOverlay() {
  const isActive = await window.electronAPI.toggleOverlay();
  updateOverlayButton(isActive);
}

function updateOverlayButton(isActive) {
  overlayBtnText.textContent = isActive ? 'Hide Overlay' : 'Show Overlay';
  overlayBtn.classList.toggle('active', isActive);
}

async function refreshData() {
  refreshBtn.disabled = true;
  refreshBtn.innerHTML = '<span class="icon spinning">🔄</span> Refreshing...';
  
  await window.electronAPI.refreshData();
  
  setTimeout(() => {
    refreshBtn.disabled = false;
    refreshBtn.innerHTML = '<span class="icon">🔄</span> Refresh';
  }, 1000);
}

function handleFilterChange(e) {
  currentFilter = e.target.value;
  renderBosses();
}

function handleSearchInput(e) {
  searchQuery = e.target.value.toLowerCase();
  renderBosses();
}

function handleBossData(data) {
  bossData = data;
  
  // Update boss count
  bossCount.textContent = `${data.length} Bosses`;
  
  // Update connection status
  connectionStatus.textContent = 'Connected';
  connectionStatus.className = 'status-badge status-connected';
  
  // Update last update time
  lastUpdate.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
  
  // Populate map filter
  populateMapFilter();
  
  // Render bosses
  renderBosses();
}

function handleChannelStatusUpdate(data) {
  if (data.allStatus) {
    channelStatusMap.clear();
    data.allStatus.forEach(status => {
      const key = `${status.mob}_${status.channel}`;
      channelStatusMap.set(key, status);
    });
  }
  
  updateActiveTimers();
  renderBosses();
}

function handleResetEvent(data) {
  console.log('Reset event:', data);
  // Could show notification or update UI
}

function populateMapFilter() {
  const maps = new Set();
  bossData.forEach(boss => {
    if (boss.map && boss.map.name) {
      maps.add(boss.map.name);
    }
  });
  
  const currentValue = mapFilter.value;
  mapFilter.innerHTML = '<option value="all">All Maps</option>';
  
  Array.from(maps).sort().forEach(mapName => {
    const option = document.createElement('option');
    option.value = mapName;
    option.textContent = mapName;
    mapFilter.appendChild(option);
  });
  
  mapFilter.value = currentValue;
}

function renderBosses() {
  let filteredBosses = bossData;
  
  // Apply subscription filter
  if (showOnlySubscribed) {
    filteredBosses = filteredBosses.filter(boss => subscribedBosses.has(boss.id));
  }
  
  // Apply map filter
  if (currentFilter !== 'all') {
    filteredBosses = filteredBosses.filter(boss => 
      boss.map && boss.map.name === currentFilter
    );
  }
  
  // Apply search filter
  if (searchQuery) {
    filteredBosses = filteredBosses.filter(boss =>
      boss.name.toLowerCase().includes(searchQuery)
    );
  }
  
  if (filteredBosses.length === 0) {
    bossGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>No bosses found matching your criteria</p>
      </div>
    `;
    return;
  }
  
  bossGrid.innerHTML = filteredBosses.map(boss => {
    const channelStatuses = getChannelStatusForBoss(boss.id);
    const activeChannels = channelStatuses.filter(c => c.nextSpawn).length;
    const aliveChannels = channelStatuses.filter(c => c.status === 'alive' || !c.nextSpawn).length;
    const respawnInfo = boss.respawnTime > 0 
      ? `${boss.respawnTime} min respawn` 
      : 'Event boss';
    const isSubscribed = subscribedBosses.has(boss.id);
    
    return `
      <div class="boss-card ${isSubscribed ? 'subscribed' : ''}" data-boss-id="${boss.id}">
        <div class="boss-header">
          <h3 class="boss-name">${boss.name}</h3>
          <div class="boss-actions">
            <button class="subscribe-btn ${isSubscribed ? 'active' : ''}" 
                    onclick="toggleBossSubscription('${boss.id}')"
                    title="${isSubscribed ? 'Unsubscribe' : 'Subscribe for notifications'}">
              ${isSubscribed ? '⭐' : '☆'}
            </button>
            <span class="boss-uid">#${boss.uid}</span>
          </div>
        </div>
        <div class="boss-info">
          <div class="info-item">
            <span class="info-label">Map:</span>
            <span class="info-value">${boss.map ? boss.map.name : 'Unknown'}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Respawn:</span>
            <span class="info-value">${respawnInfo}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Channels:</span>
            <span class="info-value">${boss.map ? boss.map.totalChannels : '?'}</span>
          </div>
        </div>
        <div class="channel-status-bar">
          <div class="status-item alive">
            <span class="status-icon">✅</span>
            <span class="status-label">Alive:</span>
            <span class="status-count">${aliveChannels}</span>
          </div>
          <div class="status-item tracking">
            <span class="status-icon">⏱️</span>
            <span class="status-label">Tracking:</span>
            <span class="status-count">${activeChannels}</span>
          </div>
          <div class="status-item killed">
            <span class="status-icon">💀</span>
            <span class="status-label">Killed:</span>
            <span class="status-count">${channelStatuses.filter(c => c.status === 'killed' || c.nextSpawn).length}</span>
          </div>
        </div>
        ${channelStatuses.length > 0 ? `
          <div class="channel-details">
            <button class="expand-btn" onclick="toggleChannelDetails('${boss.id}')">
              <span class="expand-icon">▼</span> Show Channels (${channelStatuses.length})
            </button>
            <div class="channel-list" id="channels-${boss.id}" style="display: none;">
              ${renderChannelList(channelStatuses, boss)}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function renderChannelList(channelStatuses, boss) {
  if (channelStatuses.length === 0) {
    return '<p class="no-channels">No channel data available</p>';
  }
  
  return channelStatuses.slice(0, 50).map(status => {
    const hasTimer = status.nextSpawn && new Date(status.nextSpawn).getTime() > Date.now();
    const timeRemaining = hasTimer ? new Date(status.nextSpawn).getTime() - Date.now() : 0;
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    return `
      <div class="channel-item ${hasTimer ? 'has-timer' : 'alive'}">
        <span class="channel-number">Ch ${status.channel}</span>
        <span class="channel-status-indicator ${hasTimer ? 'killed' : 'alive'}">
          ${hasTimer ? '💀' : '✅'}
        </span>
        ${hasTimer ? `
          <span class="channel-timer">${minutes}:${seconds.toString().padStart(2, '0')}</span>
        ` : `
          <span class="channel-alive">Alive</span>
        `}
      </div>
    `;
  }).join('');
}

function toggleChannelDetails(bossId) {
  const channelList = document.getElementById(`channels-${bossId}`);
  const expandBtn = channelList.previousElementSibling;
  const expandIcon = expandBtn.querySelector('.expand-icon');
  
  if (channelList.style.display === 'none') {
    channelList.style.display = 'grid';
    expandIcon.textContent = '▲';
    expandBtn.innerHTML = `<span class="expand-icon">▲</span> Hide Channels`;
  } else {
    channelList.style.display = 'none';
    expandIcon.textContent = '▼';
    const count = channelList.children.length;
    expandBtn.innerHTML = `<span class="expand-icon">▼</span> Show Channels (${count})`;
  }
}

function getChannelStatusForBoss(bossId) {
  const statuses = [];
  channelStatusMap.forEach((status) => {
    if (status.mob === bossId) {
      statuses.push(status);
    }
  });
  return statuses.sort((a, b) => a.channel - b.channel);
}

function updateActiveTimers() {
  const now = Date.now();
  const timers = [];
  
  channelStatusMap.forEach((status) => {
    if (status.nextSpawn) {
      const spawnTime = new Date(status.nextSpawn).getTime();
      const timeRemaining = spawnTime - now;
      
      if (timeRemaining > 0) {
        const boss = bossData.find(b => b.id === status.mob);
        if (boss) {
          // Filter by subscription if needed
          const isSubscribed = subscribedBosses.has(status.mob);
          timers.push({
            boss: boss.name,
            bossId: status.mob,
            channel: status.channel,
            spawnTime,
            timeRemaining,
            map: boss.map ? boss.map.name : 'Unknown',
            isSubscribed
          });
        }
      }
    }
  });
  
  // Sort by time remaining
  timers.sort((a, b) => a.timeRemaining - b.timeRemaining);
  
  if (timers.length === 0) {
    activeTimers.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⏰</span>
        <p>No active timers. Waiting for boss kills...</p>
      </div>
    `;
    return;
  }
  
  activeTimers.innerHTML = timers.slice(0, 12).map(timer => {
    const minutes = Math.floor(timer.timeRemaining / 60000);
    const seconds = Math.floor((timer.timeRemaining % 60000) / 1000);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const progress = 100 - ((timer.timeRemaining / (30 * 60 * 1000)) * 100);
    const urgency = timer.timeRemaining < 300000 ? 'urgent' : 
                    timer.timeRemaining < 600000 ? 'soon' : 'normal';
    
    return `
      <div class="timer-card ${urgency} ${timer.isSubscribed ? 'subscribed-timer' : ''}">
        <div class="timer-header">
          <h4 class="timer-boss">
            ${timer.isSubscribed ? '<span class="star-icon">⭐</span>' : ''}
            ${timer.boss}
          </h4>
          <span class="timer-channel">Ch ${timer.channel}</span>
        </div>
        <div class="timer-time">${timeStr}</div>
        <div class="timer-map">${timer.map}</div>
        <div class="timer-progress">
          <div class="timer-progress-bar" style="width: ${Math.min(100, progress)}%"></div>
        </div>
      </div>
    `;
  }).join('');
  
  // Also update channel details if visible
  document.querySelectorAll('.channel-list[style*="grid"]').forEach(list => {
    const bossId = list.id.replace('channels-', '');
    const boss = bossData.find(b => b.id === bossId);
    if (boss) {
      const channelStatuses = getChannelStatusForBoss(bossId);
      list.innerHTML = renderChannelList(channelStatuses, boss);
    }
  });
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
