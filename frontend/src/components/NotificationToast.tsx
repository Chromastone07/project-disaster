import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../store/appStore';

// Listens to store changes driven by the single SSE connection in App.tsx
// instead of opening a duplicate SSE connection.
export default function NotificationToast() {
  const { reports, broadcasts, civic_issues } = useAppStore();
  const [toasts, setToasts] = React.useState<{id: number; message: string; type: string}[]>([]);
  
  // Track previous counts to detect new items
  const prevCounts = useRef({ reports: 0, broadcasts: 0, civic_issues: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    // Skip the first render (initial data load)
    if (!initialized.current) {
      prevCounts.current = { reports: reports.length, broadcasts: broadcasts.length, civic_issues: civic_issues.length };
      initialized.current = true;
      return;
    }

    const newToasts: {id: number; message: string; type: string}[] = [];

    if (reports.length > prevCounts.current.reports) {
      newToasts.push({ id: Date.now(), message: 'New incident reported (Pending review)', type: 'alert' });
    }
    if (broadcasts.length > prevCounts.current.broadcasts) {
      const latest = broadcasts[0];
      newToasts.push({ id: Date.now() + 1, message: latest?.message || 'Emergency Broadcast', type: 'alert' });
    }
    if (civic_issues.length > prevCounts.current.civic_issues) {
      newToasts.push({ id: Date.now() + 2, message: 'New civic issue reported', type: 'info' });
    }

    prevCounts.current = { reports: reports.length, broadcasts: broadcasts.length, civic_issues: civic_issues.length };

    if (newToasts.length > 0) {
      setToasts(prev => [...newToasts, ...prev].slice(0, 5));
      // Auto dismiss
      newToasts.forEach(t => {
        setTimeout(() => {
          setToasts(prev => prev.filter(x => x.id !== t.id));
        }, t.type === 'alert' ? 10000 : 5000);
      });
    }
  }, [reports.length, broadcasts.length, civic_issues.length]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id} className={`bg-slate-900 text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 backdrop-blur bg-opacity-90 border cursor-pointer ${toast.type === 'alert' ? 'border-rose-500' : 'border-slate-700'}`} onClick={() => setToasts(ts => ts.filter(t => t.id !== toast.id))}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === 'alert' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
