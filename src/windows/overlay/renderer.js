// Overlay window renderer - Shows alive channels for subscribed bosses
let bossData = [];
let subscribedBosses = new Set();
let showOnlySubscribed = true; // Default to showing only subscribed
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// UI Elements
const dragHandle = document.getElementById('dragHandle');
const settingsBtn = document.getElementById('settingsBtn');
const filterIcon = document.getElementById('filterIcon');
const opacitySlider = document.getElementById('opacitySlider');
const overlayTimers = document.getElementById('overlayTimers');
const timerCount = document.getElementById('timerCount');

// Initialize
init();

async function init() {
  // Load subscribed bosses
  const subscribed = await window.electronAPI.getSubscribedBosses();
  subscribedBosses = new Set(subscribed);
  
  // Load boss data
  const bosses = await window.electronAPI.getBosses();
  if (bosses) {
    bossData = bosses;
  }
  
  // Set up event listeners
  settingsBtn.addEventListener('click', toggleFilter);
  opacitySlider.addEventListener('input', handleOpacityChange);
  
  // Drag functionality
  dragHandle.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);

  // Listen for data updates
  window.electronAPI.onBossDataLoaded(handleBossData);
  window.electronAPI.onChannelDataLoaded(updateDisplay);
  window.electronAPI.onChannelUpdate(handleChannelUpdate);

  // Update display every 5 seconds to refresh stale data
  setInterval(updateDisplay, 5000);
  
  // Update subscribed bosses list periodically
  setInterval(async () => {
    const subscribed = await window.electronAPI.getSubscribedBosses();
    subscribedBosses = new Set(subscribed);
    updateDisplay();
  }, 2000);
  
  updateFilterIcon();
  updateDisplay();
}

function toggleFilter() {
  showOnlySubscribed = !showOnlySubscribed;
  updateFilterIcon();
  updateDisplay();
}

function updateFilterIcon() {
  if (showOnlySubscribed) {
    filterIcon.textContent = '⭐';
    settingsBtn.title = 'Showing subscribed only (click for all)';
    settingsBtn.classList.add('active');
  } else {
    filterIcon.textContent = '📋';
    settingsBtn.title = 'Showing all bosses (click for subscribed only)';
    settingsBtn.classList.remove('active');
  }
}

function handleOpacityChange(e) {
  e.stopPropagation();
  const opacity = e.target.value / 100;
  window.electronAPI.setOverlayOpacity(opacity);
}

function startDrag(e) {
  // Don't drag if clicking on interactive elements
  if (e.target.tagName === 'BUTTON' || 
      e.target.tagName === 'INPUT' || 
      e.target.closest('button') || 
      e.target.closest('input')) {
    return;
  }
  
  isDragging = true;
  dragOffset.x = e.clientX;
  dragOffset.y = e.clientY;
  dragHandle.style.cursor = 'grabbing';
}

function drag(e) {
  if (!isDragging) return;
  
  const deltaX = e.screenX - dragOffset.x;
  const deltaY = e.screenY - dragOffset.y;
  
  window.electronAPI.setOverlayPosition(
    window.screenX + deltaX,
    window.screenY + deltaY
  );
}

function stopDrag() {
  if (isDragging) {
    isDragging = false;
    dragHandle.style.cursor = 'grab';
  }
}

function handleBossData(data) {
  bossData = data;
  updateDisplay();
}

function handleChannelUpdate(data) {
  // Re-render when channels update
  updateDisplay();
}

async function updateDisplay() {
  if (!bossData || bossData.length === 0) {
    overlayTimers.innerHTML = `
      <div class="overlay-empty">
        <span class="empty-icon">⏳</span>
        <p>Loading boss data...</p>
      </div>
    `;
    return;
  }

  // Get bosses to display (filter by subscription if needed)
  const bossesToShow = showOnlySubscribed 
    ? bossData.filter(boss => subscribedBosses.has(boss.id))
    : bossData;

  if (bossesToShow.length === 0) {
    overlayTimers.innerHTML = `
      <div class="overlay-empty">
        <span class="empty-icon">⭐</span>
        <p>No subscribed bosses.<br>Subscribe to bosses in main window!</p>
      </div>
    `;
    timerCount.textContent = '0 bosses';
    return;
  }

  // Get alive channels for each boss
  const bossesWithAliveChannels = [];
  
  for (const boss of bossesToShow) {
    try {
      const aliveChannels = await window.electronAPI.getAliveChannels(boss.id);
      if (aliveChannels && aliveChannels.length > 0) {
        bossesWithAliveChannels.push({
          boss,
          aliveChannels: aliveChannels.sort((a, b) => a.hp - b.hp).slice(0, 10) // Show max 10 per boss, sorted by HP
        });
      }
    } catch (error) {
      console.error(`Error getting alive channels for ${boss.name}:`, error);
    }
  }

  // Update count
  const totalAliveChannels = bossesWithAliveChannels.reduce((sum, item) => sum + item.aliveChannels.length, 0);
  timerCount.textContent = `${bossesWithAliveChannels.length} boss${bossesWithAliveChannels.length !== 1 ? 'es' : ''}, ${totalAliveChannels} alive`;

  if (bossesWithAliveChannels.length === 0) {
    overlayTimers.innerHTML = `
      <div class="overlay-empty">
        <span class="empty-icon">💤</span>
        <p>${showOnlySubscribed ? 'No subscribed bosses have alive channels' : 'No bosses have alive channels'}</p>
      </div>
    `;
    return;
  }

  // Render boss groups
  overlayTimers.innerHTML = bossesWithAliveChannels.map(({ boss, aliveChannels }) => {
    const isSubscribed = subscribedBosses.has(boss.id);
    
    return `
      <div class="boss-group ${isSubscribed ? 'subscribed' : ''}">
        <div class="boss-header">
          ${isSubscribed ? '<span class="star-badge">⭐</span>' : ''}
          <span class="boss-name">${boss.name}</span>
          <span class="channel-count">${aliveChannels.length} alive</span>
        </div>
        <div class="channel-grid">
          ${aliveChannels.map(channel => {
            const hpClass = getHPClass(channel.hp);
            return `
              <div class="channel-pill-container-popup" title="Channel ${channel.channelNumber}: ${channel.hp}% HP">
                <div class="channel-pill-number-popup">${channel.channelNumber}</div>
                <div class="channel-pill-bar-popup">
                  <div class="channel-pill-progress ${hpClass}" style="width: ${channel.hp}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function getHPClass(hp) {
  if (hp >= 60) return 'healthy';
  if (hp >= 30) return 'low';
  if (hp > 0) return 'critical';
  return 'dead';
}
