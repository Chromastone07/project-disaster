import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import StatusBadge from '../../components/StatusBadge';

// Helper to center map
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 14, { animate: true });
  return null;
}

export default function VolunteerTaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { reports, updateReport } = useAppStore();
  
  const task = reports.find(r => r.id === id);
  const [statusState, setStatusState] = useState<'accepted' | 'transit' | 'site' | 'completed'>('transit');
  const [notes, setNotes] = useState('');
  
  if (!task) return <div className="p-8 text-center text-slate-500">Task not found</div>;

  const handleUpdateStatus = (newStatus: 'transit' | 'site' | 'completed') => {
    setStatusState(newStatus);
    if (newStatus === 'completed' && token) {
      updateReport(task.id, { status: 'resolved' }, token);
      alert('Task resolved successfully!');
      navigate('/volunteer/home');
    }
  };

  return (
    <div className="col-span-1 md:col-span-3 space-y-6 max-w-5xl mx-auto">
      <Link to="/volunteer/home" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider flex items-center gap-1">
        &larr; Back to Command
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header content */}
        <div className="p-6 bg-slate-900 text-white relative">
          <div className="absolute top-6 right-6">
            <StatusBadge status={task.status} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Operation: {task.id.split('-')[0]}</h2>
          <div className="flex gap-2 items-center">
            <StatusBadge status={task.category} />
            <StatusBadge status={task.severity} type="severity" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[500px]">
          {/* Left - Detail & Actions */}
          <div className="p-6 w-full md:w-1/2 flex flex-col overflow-y-auto custom-scroll">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
            <p className="text-slate-800 text-sm mb-6">{task.description}</p>
            
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Location</h3>
            <p className="text-slate-600 text-sm font-mono bg-slate-50 p-2 rounded border border-slate-200 mb-6">
              Lat: {task.latitude != null ? task.latitude.toFixed(6) : ""}<br/>
              Lng: {task.longitude != null ? task.longitude.toFixed(6) : ""}
            </p>

            <div className="mt-auto space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Field Notes</h3>
                <textarea 
                  className="w-full h-24 p-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500" 
                  placeholder="Record observations, victim count, needed supplies..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Update Mission Status</h3>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => handleUpdateStatus('transit')}
                    className={`flex-1 text-xs font-bold py-2 px-1 rounded-md transition-all ${statusState === 'transit' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    IN TRANSIT
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('site')}
                    className={`flex-1 text-xs font-bold py-2 px-1 rounded-md transition-all ${statusState === 'site' ? 'bg-amber-500 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    ON SITE
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('completed')}
                    className={`flex-1 text-xs font-bold py-2 px-1 rounded-md transition-all ${statusState === 'completed' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}
                  >
                    COMPLETED
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right - Map */}
          <div className="w-full md:w-1/2 bg-slate-100 relative shadow-inner">
            <MapContainer center={[task.latitude, task.longitude]} zoom={14} className="h-full w-full z-0">
              <TileLayer url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
              <MapUpdater center={[task.latitude, task.longitude]} />
              <Marker position={[task.latitude, task.longitude]}>
                <Popup>
                  <div className="text-center font-bold text-sm">Target Location</div>
                </Popup>
              </Marker>
            </MapContainer>
            
            <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-end">
               <a 
                 href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                 target="_blank"
                 rel="noreferrer"
                 className="bg-slate-900/90 backdrop-blur text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-800 transition shadow-lg flex items-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                 START NAVIGATION
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
