import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import L from 'leaflet';
import StatusBadge from '../components/StatusBadge';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Function to generate custom SVG icon based on severity
const getMarkerIcon = (severity: string) => {
  let color = '#22c55e'; // green
  if(severity === 'critical') color = '#e11d48'; // rose
  if(severity === 'high') color = '#f97316'; // orange
  if(severity === 'medium') color = '#eab308'; // yellow

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>`;
    
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgIcon,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function PublicMap() {
  const { reports } = useAppStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const loc = useLocation();
  const activeReports = reports.filter(r => r.status === 'unreviewed' || r.status === 'active' || r.status === 'in_progress');

  const [mapCenter, setMapCenter] = useState<[number, number]>([19.076, 72.877]);
  const [mapZoom, setMapZoom] = useState(12);

  const [osmLocations, setOsmLocations] = useState<any[]>([]);
  const [showOSM, setShowOSM] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const loadOSMAmenities = async (lat: number, lng: number) => {
    setIsLocating(true);
    const radius = 10000; // 10km search
    const query = `
      [out:json];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="police"](around:${radius},${lat},${lng});
        node["amenity"="fire_station"](around:${radius},${lat},${lng});
      );
      out body;
    `;
    try {
      const resp = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: query
      });
      const data = await resp.json();
      const newLocs = data.elements.map((el: any) => {
        let cat = 'hospital';
        if (el.tags.amenity === 'police') cat = 'police';
        if (el.tags.amenity === 'fire_station') cat = 'fire_station';
        return {
          id: `osm-${el.id}`,
          name: el.tags.name || `Public ${el.tags.amenity.replace('_', ' ')}`,
          category: cat,
          latitude: el.lat,
          longitude: el.lon,
        };
      });
      setOsmLocations(newLocs);
      setShowOSM(true);
    } catch (err) {
      console.error("OSM fetch failed", err);
    } finally {
      setIsLocating(false);
    }
  };

  const getOsmMarkerIcon = (category: string) => {
    let color = '#3b82f6';
    if (category === 'hospital') color = '#ef4444';
    if (category === 'police') color = '#1d4ed8';
    if (category === 'fire_station') color = '#f97316';
    
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
             </svg>`,
      iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -26]
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const reportId = params.get('id');
    if (reportId) {
      const rep = reports.find(r => r.id === reportId);
      if (rep) {
        setMapCenter([rep.latitude, rep.longitude]);
        setMapZoom(16);
      }
    }
  }, [loc.search, reports]);

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="h-16 bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between px-8 shrink-0 z-50 relative shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 rounded flex items-center justify-center font-bold text-lg">C</div>
            <span className="font-bold tracking-tight text-xl">C-SERP</span>
          </div>
          <div className="w-px h-6 bg-slate-800 mx-2"></div>
          <h1 className="font-medium text-slate-300">Global Incident Map</h1>
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-bold rounded border border-emerald-800 flex items-center gap-1 ml-2">
            <span className="status-dot bg-emerald-500 animate-pulse-slow"></span>
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-3">
           {user && (
             <button onClick={() => navigate(-1)} className="text-sm font-bold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded transition-colors text-white mr-2 border border-slate-700">
               &larr; GO BACK
             </button>
           )}
           {user ? (
             <Link to={`/${user.role}/home`} className="text-sm font-bold bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded transition-colors text-white shadow-sm">
               DASHBOARD
             </Link>
           ) : (
             <Link to="/login" className="text-sm font-bold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded transition-colors text-white border border-slate-700">
               LOGIN TO DASHBOARD
             </Link>
           )}
        </div>
      </header>
      
      <div className="flex-1 bg-slate-100 p-4 relative flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col z-[400] relative shrink-0 h-[50vh] md:h-auto overflow-hidden">
           <div className="p-4 border-b border-slate-100 bg-slate-50">
             <h2 className="font-bold text-slate-800 text-lg">Active Incidents</h2>
             <p className="text-xs text-slate-500">Showing {activeReports.length} emergencies around the globe</p>
           </div>
           <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-4">
             {activeReports.map(report => (
               <div key={`side-${report.id}`} className="p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white" 
                 onClick={() => {
                   setMapCenter([report.latitude, report.longitude]);
                   setMapZoom(16);
                 }}>
                 <div className="flex items-center justify-between mb-2">
                   <span className="font-mono text-[10px] font-bold text-slate-400">{report.id}</span>
                   <StatusBadge status={report.severity} type="severity" />
                 </div>
                 <div className="mb-2">
                   <StatusBadge status={report.category} />
                   {report.status === 'unreviewed' && <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded uppercase tracking-wide">Unverified</span>}
                 </div>
                 <p className="text-sm font-medium text-slate-800 line-clamp-2">{report.description}</p>
                 <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded">
                   <span>Lat: {report.latitude != null ? report.latitude.toFixed(4) : ""}</span>
                   <span>Lng: {report.longitude != null ? report.longitude.toFixed(4) : ""}</span>
                 </div>
               </div>
             ))}
             {activeReports.length === 0 && (
               <div className="text-center text-slate-400 py-10 text-sm">No active incidents reported.</div>
             )}
           </div>
        </div>
      
        <div className="flex-1 flex flex-col relative rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-white">
          <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4 z-10 shrink-0">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Map Engine</span>
             <button 
               onClick={() => loadOSMAmenities(mapCenter[0], mapCenter[1])}
               disabled={isLocating}
               className="text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded hover:bg-blue-100 transition disabled:opacity-50 flex items-center gap-2"
             >
               {isLocating ? (
                 <span className="animate-pulse">Scanning area...</span>
               ) : (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                   Locate Amenities
                 </>
               )}
             </button>
          </div>
          <div className="flex-1 relative">
           <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full">
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard">
              <TileLayer 
                url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="High Contrast (Dark)">
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="High Contrast (Light)">
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <MarkerClusterGroup chunkedLoading>
            {activeReports.map(report => (
              <Marker 
                key={report.id} 
                position={[report.latitude, report.longitude]} 
                icon={getMarkerIcon(report.severity)}
              >
                <Popup className="cserp-popup">
                   <div className="min-w-[200px]">
                     <div className="flex justify-between items-center border-b pb-2 mb-2">
                       <span className="font-mono text-xs font-bold text-slate-500">{report.id}</span>
                       <StatusBadge status={report.severity} type="severity" />
                     </div>
                     <div className="mb-2 flex items-center gap-2">
                       <StatusBadge status={report.category} />
                       {report.status === 'unreviewed' && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1 rounded uppercase tracking-wide">Unverified</span>}
                     </div>
                     <p className="text-sm font-medium text-slate-800 line-clamp-3 mb-2">{report.description}</p>
                     
                     {user && (
                       <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100">
                         {report.reporter_id !== user.id && (
                           <>
                             {!report.applied_volunteers?.includes(user.id) ? (
                               <button 
                                 onClick={() => {
                                   const token = useAuthStore.getState().token;
                                   if (token) useAppStore.getState().applyForTask(report.id, token);
                                 }}
                                 className="w-full text-xs font-bold bg-slate-900 text-white rounded py-2 hover:bg-slate-800 transition"
                               >
                                 APPLY TO VOLUNTEER
                               </button>
                             ) : (
                               <div className="w-full text-xs font-bold text-center bg-slate-100 text-slate-500 rounded py-2">
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
                                       const token = useAuthStore.getState().token;
                                       if (token) useAppStore.getState().enrollAsVictim(report.id, token);
                                     } else {
                                       alert(`You are ${distance.toFixed(1)}km away. Must be within 2km to enroll as a victim.`);
                                     }
                                   }, (err) => {
                                      alert("Could not verify your location. Please check browser permissions.");
                                   });
                                 }}
                                 className="w-full text-[10px] font-bold bg-rose-50 text-rose-600 rounded py-1.5 hover:bg-rose-100 transition border border-rose-200"
                               >
                                 MARK MYSELF AS VICTIM (WITHIN 2KM)
                               </button>
                             ) : (
                               <div className="w-full text-[10px] font-bold text-center bg-rose-600 text-white rounded py-1.5 border border-rose-700">
                                 MARKED AS VICTIM
                               </div>
                             )}
                           </>
                         )}
                       </div>
                     )}

                     <div className="text-[10px] text-slate-400 mt-2 text-right">
                       {new Date(report.created_at).toLocaleString()}
                     </div>
                   </div>
                </Popup>
              </Marker>
            ))}
            
            {showOSM && osmLocations.map(loc => (
               <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={getOsmMarkerIcon(loc.category)}>
                 <Popup>
                   <div className="min-w-[150px]">
                     <h4 className="font-bold text-sm mb-1">{loc.name}</h4>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{loc.category.replace('_', ' ')}</span>
                   </div>
                 </Popup>
               </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 z-[400] flex flex-col gap-2">
           <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b pb-2 mb-1">Severity Legend</h4>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-600"></div><span className="text-xs font-medium text-slate-700">Critical</span></div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div><span className="text-xs font-medium text-slate-700">High</span></div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-xs font-medium text-slate-700">Medium</span></div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs font-medium text-slate-700">Low</span></div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
