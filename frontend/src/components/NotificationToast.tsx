import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSSE } from '../hooks/useSSE';

// Simple global notification toast manager
export default function NotificationToast() {
  const { token } = useAuthStore();
  const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const sseData = useSSE(`${apiUrl}/notifications/stream`);
  
  const [toasts, setToasts] = React.useState<{id: number; message: string; type: string; level?: string}[]>([]);

  useEffect(() => {
    if (sseData && sseData.type && sseData.type !== 'heartbeat') {
      const newToast = {
        id: Date.now(),
        message: sseData.type === 'report_created' ? 'Unverified incident reported (Pending review)' : 
                 sseData.type === 'report_updated' ? 'Report status updated' : 
                 sseData.type === 'civic_issue_created' ? 'New civic issue reported' : 
                 sseData.type === 'civic_issue_updated' ? 'Civic issue status updated' : 
                 sseData.type === 'broadcast_alert' ? sseData.data?.message || 'Emergency Broadcast' :
                 'System notification received',
        type: sseData.type === 'broadcast_alert' || sseData.type === 'report_created' ? 'alert' : 'info',
        level: sseData.data?.level || 'info'
      };
      
      setToasts(prev => [newToast, ...prev].slice(0, 5)); // Keep max 5
      
      // Auto dismiss, but keep alerts longer
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, newToast.type === 'alert' ? 15000 : 5000);
    }
  }, [sseData]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id} className={`bg-slate-900 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 backdrop-blur bg-opacity-90 border cursor-pointer animate-in fade-in slide-in-from-top-4 ${toast.level === 'critical' ? 'border-rose-500' : 'border-slate-700'}`} onClick={() => setToasts(ts => ts.filter(t => t.id !== toast.id))}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'alert' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
