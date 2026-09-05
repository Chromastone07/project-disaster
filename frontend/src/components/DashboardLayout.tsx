import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Link, useLocation } from 'react-router-dom';

export default function DashboardLayout({ children, title = "Dashboard" }: { children: React.ReactNode, title?: string }) {
  const { user } = useAuthStore();
  const { reports } = useAppStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  const getLinks = () => {
    if (user?.role === 'authority') {
      return [
        { name: 'Command Center', path: '/authority/home' },
        { name: 'Live Map', path: '/authority/map' },
        { name: 'Disaster Reports', path: '/authority/reports', badge: reports.filter(r => r.status === 'unreviewed').length || undefined },
        { name: 'Civic Issues', path: '/authority/civic' },
        { name: 'Assign Volunteers', path: '/authority/matching' },
        { name: 'Resource Registry', path: '/authority/inventory' },
        { name: 'User Management', path: '/authority/users' },
        { name: 'Emergency Broadcast', path: '/authority/broadcast' },
        { name: 'Activity Logs', path: '/authority/logs' },
        { name: 'Audit & Export', path: '/authority/export' },
      ];
    } else if (user?.role === 'citizen') {
      return [
        { name: 'Dashboard', path: '/citizen/home' },
        { name: 'Report Emergency', path: '/citizen/report' },
        { name: 'Report Civic Issue', path: '/citizen/civic' },
        { name: 'Find Assistance', path: '/citizen/find-help' },
        { divider: true, name: 'Volunteer Center' },
        { name: 'Volunteer Dashboard', path: '/volunteer/home' },
        { name: 'Volunteer Profile', path: '/volunteer/profile' },
      ];
    } else if (user?.role === 'volunteer') {
      return [
        { name: 'Task Queue', path: '/volunteer/home' },
        { name: 'Live Field Map', path: '/volunteer/map' },
        { name: 'Resource Hub', path: '/volunteer/resources' },
        { name: 'My Profile', path: '/volunteer/profile' },
        { divider: true, name: 'Civilian Services' },
        { name: 'Report Emergency', path: '/citizen/report' },
        { name: 'Find Assistance', path: '/citizen/find-help' },
        { name: 'Report Civic Issue', path: '/citizen/civic' },
      ];
    }
    return [];
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      <nav className="w-64 bg-slate-950 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 rounded flex items-center justify-center font-bold text-lg">C</div>
            <span className="font-bold tracking-tight text-xl">C-SERP</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Emergency Response Platform</p>
        </div>
        <div className="flex-1 py-4 flex flex-col gap-1">
          {getLinks().map((link, idx) => {
            if (link.divider) {
              return (
                <div key={`div-${idx}`} className="px-4 py-2 mt-4 mb-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{link.name}</p>
                </div>
              );
            }
            return (
              <Link 
                key={link.path as string} 
                to={link.path as string} 
                className={`px-4 py-2 flex items-center gap-3 cursor-pointer ${link.path && isActive(link.path) ? 'bg-slate-900 border-l-4 border-rose-600' : 'hover:bg-slate-900 text-slate-400'}`}
              >
                <span className="text-sm font-medium">{link.name}</span>
                {link.badge !== undefined && link.badge > 0 && (
                   <span className="ml-auto bg-rose-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold">{link.badge}</span>
                )}
              </Link>
            );
          })}
          
          <Link to="/map" className="px-4 py-2 hover:bg-slate-900 flex items-center gap-3 cursor-pointer text-slate-400 mt-4 border-t border-slate-800 pt-4">
             <span className="text-sm font-medium">Public Map</span>
          </Link>
        </div>
        <div className="p-4 bg-slate-900/50 mt-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="text-xs flex-1">
                <p className="font-semibold">{user?.name || 'User'}</p>
                <p className="text-slate-500 capitalize">{user?.role || 'Guest'}</p>
              </div>
            </div>
            <button 
              onClick={() => useAuthStore.getState().logout()}
              className="w-full py-1.5 text-xs font-bold bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-lg">{title}</h1>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 flex items-center gap-1">
              <span className="status-dot bg-emerald-500 animate-pulse-slow"></span>
              LIVE: SYSTEM ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-6 pr-16">

          </div>
        </header>

        <div className="flex-1 overflow-auto custom-scroll p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
