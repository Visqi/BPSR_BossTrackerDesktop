// ============ REALTIME SSE CONNECTION ============
// Browser-native EventSource for PocketBase realtime updates

// Access config from window object (set by api-config.js)
const { 
  API_BASE_URL, 
  SSE_EVENT_TYPES, 
  SSE_SUBSCRIPTIONS, 
  EVENT_HANDLERS 
} = window.API_CONFIG;

let eventSource = null;

export function connectRealtimeSSE() {
  console.log('🔌 Connecting to PocketBase realtime SSE...');
  
  const realtimeURL = `${API_BASE_URL}/realtime`;
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
  
  // Dynamically register event listeners for all configured event types
  Object.entries(EVENT_HANDLERS).forEach(([eventType, handler]) => {
    eventSource.addEventListener(eventType, (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`🔄 ${eventType} event:`, data);
        
        // Use the handler's parse function to transform the data
        const parsedData = handler.parse(data);
        
        if (parsedData) {
          console.log(`✓ Parsed ${eventType}:`, parsedData);
          
          // Dispatch as custom event for renderer to handle
          window.dispatchEvent(new CustomEvent('realtime-update', { 
            detail: parsedData
          }));
        }
      } catch (error) {
        console.error(`Error parsing ${eventType} event:`, error);
      }
    });
  });
  
  // Generic message handler - catches ALL realtime events
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      
      // Skip PB_CONNECT messages (already handled)
      if (data.clientId && !data.action) {
        return;
      }
      
      console.log('📨 SSE Event received - Type:', data.type, 'Data:', data.data);
      
      // Check if this event has a handler
      const eventType = data.type;
      console.log('🔍 Looking for handler:', eventType);
      console.log('🔍 Available handlers:', Object.keys(EVENT_HANDLERS));
      
      if (eventType && EVENT_HANDLERS[eventType]) {
        console.log(`🔄 Processing ${eventType} with registered handler...`);
        
        // Use the handler's parse function to transform the data
        const parsedData = EVENT_HANDLERS[eventType].parse(data.data);
        
        if (parsedData) {
          console.log(`✓ Parsed ${eventType}:`, parsedData);
          
          // Dispatch as custom event for renderer to handle
          window.dispatchEvent(new CustomEvent('realtime-update', { 
            detail: parsedData
          }));
        }
      } else {
        // Generic event without specific handler
        console.log('🔔 Generic event (no handler):', data);
        window.dispatchEvent(new CustomEvent('realtime-update', { detail: data }));
      }
    } catch (error) {
      console.error('Error parsing SSE event:', error);
    }
  };
}

function subscribeToCollections(clientId) {
  // Use centralized subscription configuration
  console.log('📤 Sending subscription POST with:', SSE_SUBSCRIPTIONS);
  
  fetch(`${API_BASE_URL}/realtime`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId: clientId,
      subscriptions: SSE_SUBSCRIPTIONS
    })
  })
  .then(res => {
    console.log('✓ Subscription response status:', res.status);
    return res.text();
  })
  .then(data => {
    console.log('✓ Subscription confirmed');
    console.log('✓ Now listening for realtime events:', SSE_SUBSCRIPTIONS);
  })
  .catch(error => {
    console.error('❌ Subscription error:', error);
  });
}
