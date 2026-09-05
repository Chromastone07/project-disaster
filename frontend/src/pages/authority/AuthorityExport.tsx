import React from 'react';
import { useAppStore } from '../../store/appStore';
import StatusBadge from '../../components/StatusBadge';

export default function AuthorityExport() {
  const { reports, locations, inventory } = useAppStore();

  const handleExportJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      reports,
      locations,
      inventory
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cserp_export_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = Object.keys(reports[0]).join(',');
    const rows = reports.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n');
    const csvStr = `${headers}\n${rows}`;
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cserp_reports_${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="col-span-1 md:col-span-3 space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
           Data Export & Audit
        </h2>
        
        <p className="text-sm text-slate-600 mb-6 max-w-2xl">
          Download system data for post-incident analysis, auditing, and reporting. 
          Exporting data maintains compliance with disaster management data retention policies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="border border-slate-200 rounded-lg p-5">
             <h3 className="font-bold text-slate-800 mb-2">Complete System Snapshot</h3>
             <p className="text-xs text-slate-500 mb-4">Export all reports, locations, and inventory data as a JSON file for system backup and developer integration.</p>
             <button onClick={handleExportJSON} className="bg-slate-900 text-white px-4 py-2 text-sm font-bold rounded shadow-sm hover:bg-slate-800 transition-colors w-full">EXPORT AS JSON</button>
           </div>
           
           <div className="border border-slate-200 rounded-lg p-5">
             <h3 className="font-bold text-slate-800 mb-2">Incident Reports Audit</h3>
             <p className="text-xs text-slate-500 mb-4">Export only the incident reports table as a CSV file, suitable for viewing in Excel or other spreadsheet software.</p>
             <button onClick={handleExportCSV} className="border-2 border-slate-900 text-slate-900 px-4 py-2 text-sm font-bold rounded hover:bg-slate-50 transition-colors w-full">EXPORT REPORTS CSV</button>
           </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
         <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Audit Activity</h3>
         <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">2026-04-28 14:22 UTC</span>
              <span>Exported complete snapshot</span>
              <span className="ml-auto text-xs font-bold">Admin User</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">2026-04-28 09:15 UTC</span>
              <span>Modified Resource limits on BKC Center</span>
              <span className="ml-auto text-xs font-bold">Admin User</span>
            </div>
         </div>
      </div>
    </div>
  );
}
