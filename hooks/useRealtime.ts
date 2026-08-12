'use client';

import { useEffect, useRef } from 'react';

type EventCallback = (data: Record<string, unknown>) => void;

export function useRealtime(eventListeners?: Record<string, EventCallback>) {
  const listenersRef = useRef(eventListeners);

  useEffect(() => {
    listenersRef.current = eventListeners;
  }, [eventListeners]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      eventSource = new EventSource('/api/realtime');

      eventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          listenersRef.current?.onMessage?.(payload);
        } catch {}
      };

      // Add custom event listeners
      if (listenersRef.current) {
        Object.entries(listenersRef.current).forEach(([eventName, callback]) => {
          if (eventName !== 'onMessage') {
            eventSource?.addEventListener(eventName, (e: MessageEvent) => {
              try {
                const payload = JSON.parse(e.data);
                callback(payload);
              } catch {}
            });
          }
        });
      }

      eventSource.onerror = () => {
        eventSource?.close();
        reconnectTimeout = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, []);
}
