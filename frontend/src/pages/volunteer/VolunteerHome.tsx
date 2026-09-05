import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore, DisasterReport } from '../../store/appStore';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

export default function VolunteerHome() {
  const { user, token } = useAuthStore();
  const { reports, updateReport, broadcasts, addContribution } = useAppStore();
  
  // A real app would have a dedicated Tasks table and query that. Here we derive tasks based on reports.
  // Assume active/unreviewed reports within a certain area are tasks.
  // Only show tasks assigned to me
  const availableTasks = reports.filter(r => (r.status === 'active' || r.status === 'unreviewed') && (!r.assigned_volunteers || r.assigned_volunteers.length === 0));
  const myTasks = reports.filter(r => r.status === 'in_progress' && user && r.assigned_volunteers?.includes(user.id));
  const recentBroadcasts = broadcasts.slice(0, 3);

  const [taskStatus, setTaskStatus] = useState<Record<string, string>>({});
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

  const handleApplyTask = async (id: string) => {
    if (token) {
      await useAppStore.getState().applyForTask(id, token);
      alert("Application sent to authorities.");
    }
  };

  const handleCompleteTask = (id: string) => {
    if (token) {
      updateReport(id, { status: 'resolved' }, token);
      setTaskStatus(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const updateStatus = (id: string, status: string) => {
     setTaskStatus(prev => ({ ...prev, [id]: status }));
  };

  return (
    <>
      <div className="col-span-1 md:col-span-3 mb-2 flex justify-between items-center bg-rose-50 border border-rose-200 p-4 rounded-xl">
         <div>
           <h3 className="font-bold text-rose-800">In Danger? Request Immediate Support</h3>
           <p className="text-sm text-rose-600">As a volunteer, you can also request help if you become overwhelmed or endangered.</p>
         </div>
         <a href="/citizen/report" className="px-5 py-2 bg-rose-600 text-white font-bold text-sm rounded shadow-sm hover:bg-rose-700 transition">
           REPORT EMERGENCY
         </a>
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
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Available Incidents & Disasters</h3>
           
           <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scroll pr-2">
             {availableTasks.length > 0 ? availableTasks.map(task => (
               <div key={task.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative">
                 <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <StatusBadge status={task.category} />
                     <StatusBadge status={task.severity} type="severity" />
                   </div>
                   <span className="mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-600">
                     Recommended
                   </span>
                 </div>
                 
                 <p className="text-sm text-slate-800 font-medium mb-1 line-clamp-2">{task.description}</p>
                 
                 <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                   <span>📍 {task.latitude != null ? task.latitude.toFixed(4) : ""}, {task.longitude != null ? task.longitude.toFixed(4) : ""}</span>
                   <Link to={`/map?id=${task.id}`} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Locate on Map</Link>
                 </div>
                 
                 <div className="mt-4 flex justify-end">
                   {task.applied_volunteers?.includes(user?.id || '') ? (
                      <button disabled className="bg-slate-300 text-slate-500 px-4 py-1.5 rounded text-xs font-bold">
                        APPLICATION PENDING
                      </button>
                   ) : (
                      <button onClick={() => handleApplyTask(task.id)} className="bg-slate-900 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-slate-800 transition-colors">
                        VOLUNTEER FOR THIS INCIDENT
                      </button>
                   )}
                 </div>
               </div>
             )) : (
               <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">No available incidents nearby.</div>
             )}
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Contribute Resources</h3>
           <p className="text-sm text-slate-600 mb-4">Have supplies to donate? Let us know what you can contribute, and authorities will register it if needed.</p>
           <form onSubmit={handleContribute} className="flex flex-col gap-3">
             <div className="grid grid-cols-2 gap-3">
               <input required type="text" placeholder="What are you offering? (e.g. 50 Water bottles)" className="col-span-2 p-2 border border-slate-300 rounded text-sm" value={contributionForm.item_name} onChange={e => setContributionForm({...contributionForm, item_name: e.target.value})} />
               <input required type="number" min="1" placeholder="Quantity" className="p-2 border border-slate-300 rounded text-sm" value={contributionForm.quantity} onChange={e => setContributionForm({...contributionForm, quantity: Number(e.target.value)})} />
               <input required type="text" placeholder="Unit (e.g. boxes, units)" className="p-2 border border-slate-300 rounded text-sm" value={contributionForm.unit} onChange={e => setContributionForm({...contributionForm, unit: e.target.value})} />
             </div>
             <button disabled={isSubmittings} type="submit" className="bg-emerald-600 text-white font-bold p-2 text-sm rounded shadow hover:bg-emerald-700 disabled:opacity-50 transition">
               {isSubmittings ? 'Submitting...' : 'Offer Contribution'}
             </button>
           </form>
        </div>
      </div>
      
      <div className="col-span-1 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[500px]">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">My Active Deployments</h3>
           
           <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2">
             {myTasks.length > 0 ? myTasks.map(task => (
                <div key={task.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-blue-600">{task.id}</span>
                    <StatusBadge status="in_progress" />
                  </div>
                  <p className="text-xs font-medium text-slate-800 mb-2 truncate">{task.description}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-3">
                    <span>📍 {task.latitude != null ? task.latitude.toFixed(4) : ""}, {task.longitude != null ? task.longitude.toFixed(4) : ""}</span>
                    <Link to={`/volunteer/task/${task.id}`} className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Open Task Details</Link>
                  </div>
                  
                  {/* Task Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Completion Progress</span>
                      <span className="text-[10px] font-bold text-blue-600">{task.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2 mb-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${task.progress || 0}%` }}></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" max="100" step="5"
                        value={task.progress || 0}
                        onChange={(e) => {
                          if (token) updateReport(task.id, { progress: Number(e.target.value) }, token);
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  {/* Task progress stepper */}
                  <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-slate-400">
                    <button 
                      onClick={() => updateStatus(task.id, 'transit')}
                      className={`flex-1 text-center py-1 rounded-l border-r border-slate-300 transition-colors ${taskStatus[task.id] === 'transit' ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-200 hover:bg-slate-300'}`}
                    >
                      IN TRANSIT
                    </button>
                    <button 
                      onClick={() => updateStatus(task.id, 'site')}
                      className={`flex-1 text-center py-1 transition-colors border-r border-slate-300 ${taskStatus[task.id] === 'site' ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-200 hover:bg-slate-300'}`}
                    >
                      ON SITE
                    </button>
                    <button onClick={() => handleCompleteTask(task.id)} className="flex-1 text-center py-1 bg-emerald-600 text-emerald-50 hover:bg-emerald-500 transition-colors rounded-r shadow-sm">RESOLVE</button>
                  </div>
                </div>
             )) : (
                <div className="text-center mt-20 text-slate-400 text-xs">You have no active deployments.</div>
             )}
           </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
           <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">My Profile Skills</h3>
           <div className="flex flex-wrap gap-2">
             <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-medium border border-emerald-200">First Aid Certified</span>
             <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium border border-blue-200">Driving License</span>
             <span className="text-[10px] px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium border border-purple-200">Bilingual</span>
           </div>
        </div>
      </div>
    </>
  );
}
