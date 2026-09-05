import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import SixStageTimeline from '../../components/SixStageTimeline';
import StatusBadge from '../../components/StatusBadge';

export default function CitizenReportDetail() {
  const { id } = useParams();
  const { reports, applyForTask, enrollAsVictim } = useAppStore();
  const { user, token } = useAuthStore();
  const report = reports.find(r => r.id === id);

  if (!report) {
    return <div className="p-6 text-slate-500">Report not found.</div>;
  }

  // Calculate current stage index based on status
  const getStageIndex = (status: string) => {
    switch (status) {
      case 'unreviewed': return 0;
      case 'active': return 2; // Validated
      case 'in_progress': return 3; // Assigned or On site depending on task, default assigned
      case 'resolved': return 5;
      default: return 0;
    }
  };

  const currentStage = getStageIndex(report.status);
  
  // Mock timestamps
  const timestamps = [
    new Date(report.created_at).toLocaleTimeString(),
    currentStage >= 1 ? new Date(new Date(report.created_at).getTime() + 600000).toLocaleTimeString() : null, // +10 mins
    currentStage >= 2 ? new Date(new Date(report.created_at).getTime() + 1800000).toLocaleTimeString() : null, // +30 mins
    currentStage >= 3 ? new Date(new Date(report.created_at).getTime() + 3600000).toLocaleTimeString() : null, // +60 mins
    currentStage >= 4 ? new Date(new Date(report.created_at).getTime() + 7200000).toLocaleTimeString() : null, // +120 mins
    currentStage >= 5 ? new Date().toLocaleTimeString() : null,
  ];

  return (
    <div className="col-span-1 md:col-span-3">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
          <div>
            <Link to="/citizen/home" className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 mb-2 inline-block">← Back to Dashboard</Link>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              Incident {report.id}
              <StatusBadge status={report.status} />
            </h2>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-slate-600 mb-1 capitalize">{report.category.replace('_', ' ')} Incident</div>
            <StatusBadge status={report.severity} type="severity" />
          </div>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 overflow-x-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Operation Timeline</h3>
          <div className="min-w-[600px]">
            <SixStageTimeline currentStage={currentStage} timestamps={timestamps} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Submitted Details</h3>
             <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700">
               {report.description}
             </div>
             
             <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
               <span>LAT: {report.latitude != null ? report.latitude.toFixed(6) : ""}</span>
               <span>LNG: {report.longitude != null ? report.longitude.toFixed(6) : ""}</span>
             </div>
           </div>
           
           <div className="flex flex-col gap-4">
             <div>
               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assigned Personnel & Resources</h3>
               {currentStage >= 3 ? (
                 <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg">
                   <div className="font-bold text-emerald-800 text-sm mb-1">Volunteers Deployed</div>
                   <p className="text-xs text-emerald-700">Responders have been assigned and are monitoring the situation.</p>
                 </div>
               ) : (
                 <div className="p-4 border border-slate-200 bg-white rounded-lg text-slate-400 text-sm text-center">
                   Awaiting validation and assignment.
                 </div>
               )}
             </div>

             {user && report.reporter_id !== user.id && (
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">Actions</h3>
                  
                  {!report.applied_volunteers?.includes(user.id) ? (
                    <button 
                      onClick={() => token && applyForTask(report.id, token)}
                      className="w-full text-xs font-bold bg-slate-900 text-white rounded py-2 hover:bg-slate-800 transition shadow"
                    >
                      APPLY TO VOLUNTEER
                    </button>
                  ) : (
                    <div className="w-full text-xs font-bold text-center bg-slate-200 text-slate-500 rounded py-2 border border-slate-300">
                      VOLUNTEER REQUEST SENT
                    </div>
                  )}

                  {!report.victims?.includes(user.id) ? (
                    <button 
                      onClick={() => {
                        if (!navigator.geolocation) {
                          alert("Geolocation is not supported by your browser.");
                          return;
                        }
                        navigator.geolocation.getCurrentPosition((pos) => {
                          const R = 6371;
                          const dLat = (report.latitude - pos.coords.latitude) * Math.PI / 180;
                          const dLon = (report.longitude - pos.coords.longitude) * Math.PI / 180;
                          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(pos.coords.latitude * Math.PI / 180) * Math.cos(report.latitude * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                          const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
                          if (distance <= 2) {
                            if (token) enrollAsVictim(report.id, token);
                          } else {
                            alert(`You are ${distance.toFixed(1)}km away. Must be within 2km to enroll as a victim.`);
                          }
                        }, (err) => {
                           alert("Could not verify your location. Please check browser permissions.");
                        });
                      }}
                      className="w-full text-xs font-bold bg-rose-600 text-white rounded py-2 hover:bg-rose-700 transition shadow"
                    >
                      MARK MYSELF AS VICTIM (WITHIN 2KM)
                    </button>
                  ) : (
                    <div className="w-full text-xs font-bold text-center bg-rose-100 text-rose-700 rounded py-2 border border-rose-300">
                      MARKED AS VICTIM
                    </div>
                  )}
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
