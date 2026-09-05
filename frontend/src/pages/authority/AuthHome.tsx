import React from 'react';
import { useAppStore } from '../../store/appStore';
import StatusBadge from '../../components/StatusBadge';
import SixStageTimeline from '../../components/SixStageTimeline';

export default function AuthHome() {
  const { reports, locations, inventory } = useAppStore();

  const getInventoryStatus = (itemNames: string[]) => {
    const items = inventory.filter(i => itemNames.includes(i.item_name));
    const total = items.reduce((sum, i) => sum + i.quantity, 0);
    // Arbitrary target for UI
    const target = 1000;
    return Math.min(100, Math.round((total / target) * 100));
  };

  const getStageIndex = (status: string) => {
    switch (status) {
      case 'unreviewed': return 0;
      case 'active': return 2;
      case 'in_progress': return 3;
      case 'resolved': return 5;
      default: return 0;
    }
  };

  return (
    <>
      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Command Center Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
             <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
               <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Reports Today</div>
               <div className="text-2xl font-bold font-mono">{reports.length}</div>
             </div>
             <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
               <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Active Incidents</div>
               <div className="text-2xl font-bold font-mono text-rose-600">
                 {reports.filter(r => ['active', 'in_progress'].includes(r.status)).length}
               </div>
             </div>
             <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
               <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Active Volunteers</div>
               <div className="text-2xl font-bold font-mono text-blue-600">
                 {useAppStore().users.filter((u: any) => u.role === 'volunteer').length}
               </div>
             </div>
             <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
               <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Unreviewed Reports</div>
               <div className="text-2xl font-bold font-mono text-amber-600">
                 {reports.filter(r => r.status === 'unreviewed').length}
               </div>
             </div>
          </div>
          
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Incident Intel</h3>
          <div className="space-y-3 mb-6">
            {reports.slice(0, 3).map(report => (
              <div key={report.id} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg hover:border-slate-300 transition cursor-pointer">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-mono text-xs font-bold text-slate-600">{report.id}</span>
                     <StatusBadge status={report.category} />
                     <StatusBadge status={report.severity} type="severity" />
                   </div>
                   <div className="text-sm font-medium text-slate-800 line-clamp-1">{report.description}</div>
                 </div>
                 <div className="flex flex-col items-end">
                   <StatusBadge status={report.status} />
                   <span className="text-[10px] text-slate-400 mt-1">{new Date(report.created_at).toLocaleTimeString()}</span>
                 </div>
              </div>
            ))}
          </div>

          {reports.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 overflow-x-auto mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Latest Operation Stage</h3>
              <div className="min-w-[500px]">
                <SixStageTimeline 
                   currentStage={getStageIndex(reports[0]?.status || 'unreviewed')} 
                   timestamps={Array(6).fill(null).map((_, i) => i <= getStageIndex(reports[0]?.status || 'unreviewed') ? new Date().toLocaleTimeString() : null)} 
                />
              </div>
            </div>
          )}

          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">In-Progress Task Tracker</h3>
          <div className="space-y-4">
             {reports.filter(r => r.status === 'in_progress').length > 0 ? reports.filter(r => r.status === 'in_progress').map(task => (
                <div key={task.id} className="border border-slate-200 rounded p-3 bg-white shadow-sm">
                   <div className="flex justify-between items-center mb-1">
                     <span className="font-mono text-[10px] font-bold text-blue-600">{task.id}</span>
                     <span className="text-[10px] font-bold text-slate-500">{task.progress || 0}% Complete</span>
                   </div>
                   <div className="text-xs text-slate-800 font-medium mb-2 truncate">{task.description}</div>
                   <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                     <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${task.progress || 0}%` }}></div>
                   </div>
                </div>
             )) : (
                <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">No active tasks currently tracked.</div>
             )}
          </div>
        </div>
      </div>

      <div className="col-span-1 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Resource Inventory Status</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span>Food Packets</span>
                <span>{getInventoryStatus(['Food Packets'])}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${getInventoryStatus(['Food Packets'])}%` }}></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span>Medical Kits</span>
                <span>{getInventoryStatus(['Medical Kits'])}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full transition-all" style={{ width: `${getInventoryStatus(['Medical Kits'])}%` }}></div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <div className="flex-1 bg-slate-50 p-2 rounded border border-slate-100 text-center">
              <div className="text-lg font-bold mono leading-none">{locations.filter(l => l.operational_status === 'open').length}</div>
              <div className="text-[8px] text-slate-400 uppercase font-bold tracking-tight mt-1">Shelters Open</div>
            </div>
            <div className="flex-1 bg-slate-50 p-2 rounded border border-slate-100 text-center">
              <div className="text-lg font-bold mono leading-none">{locations.filter(l => l.operational_status === 'full').length}</div>
              <div className="text-[8px] text-slate-400 uppercase font-bold tracking-tight mt-1">Sites Full</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
