import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/StatusBadge';

export default function AuthorityMatching() {
  const { reports, updateReport, users } = useAppStore();
  const { token } = useAuthStore();
  const matchingReports = reports.filter(r => r.status !== 'resolved' && r.status !== 'duplicate' && r.status !== 'archived');
  const [selectedReport, setSelectedReport] = useState(matchingReports[0]?.id || null);

  const activeReport = reports.find(r => r.id === selectedReport);
  
  const volunteers = users.filter(u => u.role === 'volunteer' || activeReport?.applied_volunteers?.includes(u.id)).map(u => ({
    id: u.id,
    name: u.name,
    score: u.score || 0.5,
    distance: `${(Math.random() * 5).toFixed(1)}km`,
    skills: u.role === 'volunteer' ? ['Available'] : ['Citizen Responder']
  }));
  
  const sortedVolunteers = [...volunteers].sort((a, b) => {
    const aApplied = activeReport?.applied_volunteers?.includes(a.id) ? 1 : 0;
    const bApplied = activeReport?.applied_volunteers?.includes(b.id) ? 1 : 0;
    if (aApplied !== bApplied) return bApplied - aApplied;
    return b.score - a.score;
  });

  const handleAssign = (volId: string) => {
    if (token && selectedReport && activeReport) {
      const currentAssigned = activeReport.assigned_volunteers || [];
      if (!currentAssigned.includes(volId)) {
        updateReport(selectedReport, { status: 'in_progress', assigned_volunteers: [...currentAssigned, volId] }, token);
      }
    }
  };

  const handleUnassign = (volId: string) => {
    if (token && selectedReport && activeReport) {
      const currentAssigned = activeReport.assigned_volunteers || [];
      const updatedAssigned = currentAssigned.filter(id => id !== volId);
      updateReport(selectedReport, { 
        assigned_volunteers: updatedAssigned,
        ...(updatedAssigned.length === 0 && activeReport.status === 'in_progress' ? { status: 'active' } : {})
      }, token);
    }
  };

  return (
    <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-[600px] flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Active Incidents</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2">
               {matchingReports.map(report => (
                 <div 
                   key={report.id} 
                   onClick={() => setSelectedReport(report.id)}
                   className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedReport === report.id ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                 >
                   <div className="flex items-center justify-between mb-2">
                     <span className="font-mono text-xs font-bold text-slate-700">{report.id}</span>
                     <div className="flex gap-2">
                       <StatusBadge status={report.category} />
                       <StatusBadge status={report.severity} type="severity" />
                     </div>
                   </div>
                   <div className="flex items-center justify-between gap-4">
                     <p className="text-sm text-slate-600 line-clamp-2 flex-1">{report.description}</p>
                     <button 
                       onClick={(e) => { 
                         e.stopPropagation(); 
                         if (window.confirm('Are you sure you want to delete this incident report?')) {
                           if (token) useAppStore.getState().deleteReport(report.id, token);
                           if (selectedReport === report.id) setSelectedReport(null);
                         }
                       }} 
                       className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded bg-white border border-slate-200"
                       title="Delete Report"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                     </button>
                   </div>
                   {report.status === 'in_progress' && (
                     <div className="mt-3">
                       <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mb-1">
                         <span>{report.assigned_volunteers?.length || 0} Volunteers Assigned</span>
                         <span>{report.progress || 0}% Complete</span>
                       </div>
                       <div className="w-full bg-slate-200 rounded-full h-1.5 relative overflow-hidden">
                         <div className="bg-rose-500 h-1.5 rounded-full transition-all" style={{ width: `${report.progress || 0}%` }}></div>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
               {matchingReports.length === 0 && (
                 <div className="text-center py-10 text-slate-400 text-sm">No active incidents found.</div>
               )}
            </div>
        </div>
      </div>
      
      <div className="col-span-1 border-l border-slate-200 md:h-[600px] pl-6 overflow-y-auto">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Volunteer Matching Queue</h3>
         {selectedReport ? (
          <div className="space-y-3">
             {sortedVolunteers.length > 0 ? sortedVolunteers.map(vol => {
               const hasApplied = activeReport?.applied_volunteers?.includes(vol.id);
               const isAssigned = activeReport?.assigned_volunteers?.includes(vol.id);
               return (
               <div key={vol.id} className={`p-3 border rounded-lg bg-white ${isAssigned ? 'border-primary-400 bg-primary-50 shadow-sm' : hasApplied ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-800">{vol.name}</span>
                      {isAssigned && <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-1 rounded inline-block w-max mt-0.5 uppercase tracking-wide">Currently Assigned</span>}
                      {hasApplied && !isAssigned && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded inline-block w-max mt-0.5 uppercase tracking-wide">Applied for this</span>}
                    </div>
                    <span className="mono text-[10px] bg-slate-100 px-1 rounded font-bold text-slate-600">{vol.score != null ? vol.score.toFixed(3) : 'N/A'} match</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {vol.skills.map(s => (
                       <span key={s} className="text-[9px] px-1.5 bg-blue-100 text-blue-800 rounded font-medium">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                    <div className="flex items-center gap-1">📍 {vol.distance} away</div>
                    <button 
                      onClick={() => {
                        if (isAssigned) {
                          handleUnassign(vol.id);
                        } else {
                          handleAssign(vol.id);
                        }
                      }} 
                      className={`px-3 py-1 rounded font-bold transition-colors text-[10px] ${isAssigned ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {isAssigned ? 'REMOVE' : 'ASSIGN'}
                    </button>
                  </div>
               </div>
             )}) : (
                <div className="text-center py-10 text-slate-400 text-sm">No active volunteers found.</div>
             )}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">Select an incident to view matches.</div>
        )}
      </div>
    </div>
  );
}
