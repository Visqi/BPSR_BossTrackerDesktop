// ============ REALTIME SSE CONNECTION ============
// Browser-native EventSource for PocketBase realtime updates

let eventSource = null;

export function connectRealtimeSSE() {
  console.log('🔌 Connecting to PocketBase realtime SSE...');
  
  const realtimeURL = 'https://db.bptimer.com/api/realtime';
  eventSource = new EventSource(realtimeURL);
  
  eventSource.onopen = () => {
    console.log('✓ SSE Connection opened');
  };
  
  eventSource.onerror = (error) => {
    console.error('❌ SSE error:', error);
    // Auto-reconnect after 5 seconds
    setTimeout(() => {
      if (eventSource) {
        eventSource.close();
      }
      console.log('Reconnecting to SSE...');
      connectRealtimeSSE();
    }, 5000);
  };
  
  // Handle PocketBase connection event
  eventSource.addEventListener('PB_CONNECT', (event) => {
    const data = JSON.parse(event.data);
    console.log('✓ PocketBase SSE connected with clientId:', data.clientId);
    
    // Subscribe to collections
    subscribeToCollections(data.clientId);
  });
  
  // Generic message handler - catches ALL realtime events
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Skip PB_CONNECT messages (already handled)
      if (data.clientId && !data.action) {
        return;
      }
      
      console.log('📨 SSE Event received:', data);
      
      // Dispatch custom event to notify the main renderer
      window.dispatchEvent(new CustomEvent('realtime-update', { detail: data }));
    } catch (error) {
      console.error('Error parsing SSE event:', error);
    }
  };
}

function subscribeToCollections(clientId) {
  const subscriptions = [
    "mobs/*",
    "mob_channel_status_sse/*",
    "mob_reset_events/*"
  ];
  
  console.log('📤 Sending subscription POST...');
  
  fetch('https://db.bptimer.com/api/realtime', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: clientId,
      subscriptions: subscriptions
    })
  })
  .then(res => {
    console.log('✓ Subscription response status:', res.status);
    return res.text();
  })
  .then(data => {
    console.log('✓ Subscription confirmed');
    console.log('✓ Now listening for realtime events...');
  })
  .catch(error => {
    console.error('❌ Subscription error:', error);
  });
}
