import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAppStore } from '../../store/appStore';
import L from 'leaflet';
import StatusBadge from '../../components/StatusBadge';

const getReportIcon = (severity: string) => {
  const color = severity === 'high' ? '#e11d48' : severity === 'medium' ? '#f59e0b' : '#3b82f6';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-alert-triangle shadow-sm">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
};

const getResourceIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-home shadow-sm">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
};

export default function VolunteerMap() {
  const { reports, locations } = useAppStore();

  const openIncidents = reports.filter(r => r.status === 'active' || r.status === 'unreviewed');

  return (
    <div className="col-span-1 md:col-span-3 flex flex-col h-full space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Live Field Operations Map</h2>
        <p className="text-sm text-slate-600">Overview of available incident tasks and active resource centers in your area.</p>
      </div>
      
      <div className="flex-1 relative rounded-xl border border-slate-200 overflow-hidden shadow-sm h-[600px] bg-slate-100">
        <MapContainer center={[19.076, 72.877]} zoom={12} className="h-full w-full z-0">
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard">
              <TileLayer url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="High Contrast (Dark)">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          <LayersControl.Overlay checked name="Active Incidents (Tasks)">
            <MarkerClusterGroup chunkedLoading>
              {openIncidents.map(report => (
                <Marker 
                  key={report.id} 
                  position={[report.latitude, report.longitude]} 
                  icon={getReportIcon(report.severity)}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{report.id}</span>
                        <StatusBadge status={report.severity} type="severity" />
                      </div>
                      <div className="mb-2">
                        <StatusBadge status={report.category} />
                      </div>
                      <p className="text-sm font-medium text-slate-800 mb-3">{report.description}</p>
                      <button className="w-full bg-slate-900 text-white font-bold text-xs py-1.5 rounded hover:bg-slate-800 transition">
                         VIEW TASK
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Resource & Relief Centers">
            <MarkerClusterGroup chunkedLoading>
              {locations.map(loc => (
                <Marker 
                  key={loc.id} 
                  position={[loc.latitude, loc.longitude]} 
                  icon={getResourceIcon()}
                >
                  <Popup>
                     <div className="min-w-[150px]">
                       <h4 className="font-bold text-sm mb-1">{loc.name}</h4>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-slate-600 capitalize">{loc.category}</span>
                         <StatusBadge status={loc.operational_status} type="location" />
                       </div>
                       <div className="text-xs text-slate-500 font-mono mb-2">
                         Capacity: {loc.capacity}
                       </div>
                     </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </LayersControl.Overlay>
        </MapContainer>
        
        <div className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg border border-slate-200">
           <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Legend</h4>
           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 block rounded-full bg-rose-600"></span>
                <span className="text-xs font-medium text-slate-700">Incident (High)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 block rounded-full bg-amber-500"></span>
                <span className="text-xs font-medium text-slate-700">Incident (Med)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 block rounded-full bg-blue-500"></span>
                <span className="text-xs font-medium text-slate-700">Incident (Low)</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-3 h-3 block rounded-full bg-emerald-500"></span>
                <span className="text-xs font-medium text-slate-700">Relief/Resource Center</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
