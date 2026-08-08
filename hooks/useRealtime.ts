'use client';
import { useEffect, useState } from 'react';

export interface RealtimeEvent<T = unknown> {
  type: 
    | 'LIVE_RESOURCE_UPLOADED'
    | 'ATTENDANCE_MARKED'
    | 'REGISTRATION_UPDATED'
    | 'NOTICE_PUBLISHED'
    | 'WINNER_ANNOUNCED'
    | 'LEADERBOARD_RECALCULATED'
    | 'NOTIFICATION_RECEIVED';
  payload: T;
  timestamp: string;
}

export function useRealtime<T = unknown>(
  eventType?: RealtimeEvent['type'],
  callback?: (event: RealtimeEvent<T>) => void
) {
  const [isConnected, setIsConnected] = useState(true);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent<T> | null>(null);

  useEffect(() => {
    // Local SSE or SignalR client simulation helper
    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<RealtimeEvent<T>>;
      if (!eventType || custom.detail.type === eventType) {
        setLastEvent(custom.detail);
        if (callback) callback(custom.detail);
      }
    };

    window.addEventListener('mcc-realtime', handleCustomEvent);
    return () => {
      window.removeEventListener('mcc-realtime', handleCustomEvent);
    };
  }, [eventType, callback]);

  const emitLocalEvent = (type: RealtimeEvent['type'], payload: T) => {
    const evt = new CustomEvent<RealtimeEvent<T>>('mcc-realtime', {
      detail: {
        type,
        payload,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(evt);
  };

  return {
    isConnected,
    lastEvent,
    emitLocalEvent
  };
}
