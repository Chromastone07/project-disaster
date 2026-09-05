import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function CitizenHome() {
  const { user, token } = useAuthStore();
  const { reports, broadcasts, addContribution } = useAppStore();

  const myReports = reports.filter(r => r.reporter_id === user?.id);
  const activeReports = reports.filter(r => r.status === 'active' || r.status === 'in_progress');
  const recentBroadcasts = broadcasts.slice(0, 3);
  
  const [contributionForm, setContributionForm] = useState({ item_name: '', quantity: 1, unit: 'items' });
  const [isSubmittings, setIsSubmittings] = useState(false);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmittings(true);
    await addContribution(contributionForm, token);
    setIsSubmittings(false);
    setContributionForm({ item_name: '', quantity: 1, unit: 'items' });
    alert("Thank you! Your contribution has been submitted. Authorities will review it shortly.");
  };

  return (
    <>
      <div className="col-span-1 md:col-span-3 mb-2 flex justify-between items-center bg-blue-50 border border-blue-200 p-4 rounded-xl">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold shrink-0">V</div>
           <div>
             <h3 className="font-bold text-blue-900">Want to help your community?</h3>
             <p className="text-sm text-blue-700">Register as a Volunteer or manage your volunteer profile if you're already one.</p>
           </div>
         </div>
         <Link to="/volunteer/profile" className="px-5 py-2 bg-blue-600 text-white font-bold text-sm rounded shadow-sm hover:bg-blue-700 transition whitespace-nowrap">
           VOLUNTEER PORTAL
         </Link>
      </div>

      <div className="col-span-1 md:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Official Broadcasts</h3>
           <div className="space-y-3">
             {recentBroadcasts.length > 0 ? recentBroadcasts.map((bc, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-red-800 uppercase">{bc.severity} ALERT</span>
                    <span className="text-[10px] text-red-500">{new Date(bc.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-red-900">{bc.message}</p>
                </div>
             )) : (
               <div className="text-sm text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-100">No active broadcasts.</div>
             )}
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Emergency Actions</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Link to="/citizen/report" className="flex flex-col items-center justify-center p-6 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors">
               <div className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">!</div>
               <h4 className="font-bold text-rose-900">Report Emergency</h4>
               <p className="text-xs text-rose-600 mt-1 text-center">Fires, Floods, Collapses, Medical Emergencies</p>
             </Link>
             
             <Link to="/citizen/find-help" className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
               <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">+</div>
               <h4 className="font-bold text-emerald-900">Find Assistance</h4>
               <p className="text-xs text-emerald-600 mt-1 text-center">Locate Shelters, Medical Centers, Supplies</p>
             </Link>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Disasters Globally</h3>
             <Link to="/map" className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800">View Map</Link>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scroll pr-2">
             {activeReports.length > 0 ? activeReports.map(report => (
               <div key={`active-${report.id}`} className="block p-3 bg-slate-50 border border-slate-200 rounded-lg">
                 <div className="flex items-start justify-between mb-2">
                   <div>
                     <span className="font-mono text-[10px] font-bold text-slate-500 block">{report.id}</span>
                     <span className="text-xs font-bold text-slate-800 capitalize">{report.category.replace('_', ' ')}</span>
                   </div>
                   <StatusBadge status={report.severity} type="severity" />
                 </div>
                 <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>
                 <div className="flex items-center gap-3 mt-3">
                   <div className="text-[10px] text-slate-400">{new Date(report.created_at).toLocaleDateString()}</div>
                   <Link to={`/map?id=${report.id}`} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>LOCATE ON MAP</Link>
                 </div>
               </div>
             )) : (
                <div className="col-span-2 text-center text-sm text-slate-500 py-4">No active disasters nearby.</div>
             )}
           </div>
        </div>


      </div>
      
      <div className="col-span-1 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[500px]">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">My Recent Reports</h3>
             <Link to="/citizen/reports" className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800">View All</Link>
           </div>
           
           {myReports.length > 0 ? (
             <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2">
               {myReports.map(report => (
                 <Link to={`/citizen/reports/${report.id}`} key={report.id} className="block p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                   <div className="flex items-start justify-between mb-2">
                     <div>
                       <span className="font-mono text-[10px] font-bold text-slate-500 block">{report.id}</span>
                       <span className="text-xs font-bold text-slate-800 capitalize">{report.category.replace('_', ' ')}</span>
                     </div>
                     <StatusBadge status={report.status} />
                   </div>
                   <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>
                   <div className="text-[10px] text-slate-400 mt-2">{new Date(report.created_at).toLocaleDateString()}</div>
                 </Link>
               ))}
             </div>
           ) : (
             <div className="flex-1 flex items-center justify-center text-sm text-slate-400 text-center">
               You haven't submitted any reports yet.
             </div>
           )}
        </div>
      </div>
    </>
  );
}
