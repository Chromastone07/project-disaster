import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export function useSSE(url: string) {
  const { token } = useAuthStore();
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    
    // Web APIs limit standard EventSource to no custom headers, 
    // so in production consider a fetch-based stream polyfill 
    // or passing token in URL query parameter.
    const eventSource = new EventSource(`${url}?token=${token}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'heartbeat') {
          setLastMessage(data);
        }
      } catch (err) {
        console.error("Error parsing SSE data", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      // Let EventSource handle auto-reconnecting on its own.
    };

    return () => {
      eventSource.close();
    };
  }, [url, token]);

  return lastMessage;
}
