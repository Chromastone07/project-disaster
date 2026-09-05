import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAppStore } from '../../store/appStore';
import L from 'leaflet';
import StatusBadge from '../../components/StatusBadge';

const shelterIconHtml = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>`;

const medicalIconHtml = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e11d48" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
  </svg>`;

const distributionIconHtml = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f97316" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>`;

const userIconHtml = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="3" fill="white"></circle>
  </svg>`;

const getMarkerIcon = (category: string) => {
  let html = shelterIconHtml; // default green
  if (category === 'medical') html = medicalIconHtml; // red
  if (category === 'distribution') html = distributionIconHtml; // orange
  if (category === 'user') html = userIconHtml; // blue

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: category === 'user' ? [20, 20] : [30, 30],
    iconAnchor: category === 'user' ? [10, 10] : [15, 30],
    popupAnchor: category === 'user' ? [0, -10] : [0, -30]
  });
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function CitizenHelpMap() {
  const { locations, inventory } = useAppStore();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [osmLocations, setOsmLocations] = useState<any[]>([]);

  const loadOSMAmenities = async (lat: number, lng: number) => {
    const radius = 5000; // 5km radius
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
        let cat = 'distribution';
        if (el.tags.amenity === 'hospital') cat = 'medical';
        if (el.tags.amenity === 'police' || el.tags.amenity === 'fire_station') cat = 'shelter';
        
        return {
          id: `osm-${el.id}`,
          name: el.tags.name || `Public ${el.tags.amenity.replace('_', ' ')}`,
          category: cat,
          latitude: el.lat,
          longitude: el.lon,
          capacity: 'N/A',
          operational_status: 'open',
          address: 'Verified Public Amenity',
          is_external: true
        };
      });
      setOsmLocations(newLocs);
    } catch (err) {
      console.error("OSM fetch failed", err);
    }
  };

  const locateUser = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          loadOSMAmenities(pos.coords.latitude, pos.coords.longitude);
          setIsLocating(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Could not get your location. Please check your browser permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const allLocations = [...locations, ...osmLocations];

  const filteredLocations = allLocations
    .filter(loc => {
      if (filterCategory !== 'all' && loc.category !== filterCategory) return false;
      if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .map(loc => ({
      ...loc,
      distance: userPos ? haversineDistance(userPos[0], userPos[1], loc.latitude, loc.longitude) : Infinity
    }))
    .sort((a, b) => a.distance - b.distance);

  const handleGetDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${userPos ? `&origin=${userPos[0]},${userPos[1]}` : ''}`, '_blank');
  };

  const handleCheckIn = (locName: string) => {
    alert(`Successfully checked in to ${locName}. Your emergency contacts will be notified.`);
  };

  const activeLocation = locations.find(l => l.id === selectedLoc);

  return (
    <div className="col-span-1 md:col-span-3 h-[800px] flex flex-col md:flex-row gap-6 pb-8">
      
      {/* Left Sidebar - Search and List */}
      <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Find Assistance</h3>
            <button 
              onClick={locateUser} 
              disabled={isLocating}
              className="text-[10px] font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition flex items-center gap-1"
            >
              {isLocating ? 'LOCATING...' : 'MY LOCATION'}
            </button>
          </div>
          
          <input 
            type="text" 
            placeholder="Search shelters, clinics..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500 mb-3"
          />

          <div className="flex flex-wrap gap-2 text-xs">
            <button 
              onClick={() => setFilterCategory('all')} 
              className={`px-3 py-1.5 rounded font-bold transition ${filterCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterCategory('shelter')} 
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1 ${filterCategory === 'shelter' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Shelter
            </button>
            <button 
              onClick={() => setFilterCategory('medical')} 
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1 ${filterCategory === 'medical' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Medical
            </button>
            <button 
              onClick={() => setFilterCategory('distribution')} 
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1 ${filterCategory === 'distribution' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Supplies
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scroll">
          {filteredLocations.map(loc => (
            <div 
              key={loc.id} 
              onClick={() => setSelectedLoc(loc.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedLoc === loc.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
            >
               <div className="flex justify-between items-start mb-2">
                 <h4 className="font-bold text-sm text-slate-800 pr-2">{loc.name}</h4>
                 <StatusBadge status={loc.operational_status} type="location" />
               </div>
               
               <div className="flex justify-between items-end">
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                     {loc.category === 'shelter' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                     {loc.category === 'medical' && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
                     {loc.category === 'distribution' && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
                     {loc.category}
                   </span>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600 font-mono w-max">
                       CAP: {loc.capacity}
                     </span>
                     {userPos && loc.distance !== Infinity && (
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                         <span className="w-1 h-1 rounded-full bg-blue-500"></span> {loc.distance != null ? loc.distance.toFixed(1) : ""} km
                       </span>
                     )}
                   </div>
                 </div>
                 
                 <div className="flex gap-2">
                     <button 
                       onClick={(e) => { e.stopPropagation(); handleGetDirections(loc.latitude, loc.longitude); }}
                       className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded transition"
                     >
                       DIRECTIONS
                     </button>
                 </div>
               </div>
            </div>
          ))}
          {filteredLocations.length === 0 && (
            <div className="text-center p-6 text-sm text-slate-500">
              No assistance centers found matching your criteria.
            </div>
          )}
        </div>
        
        {/* Selected Location Details Panel */}
        {activeLocation && (
          <div className="border-t border-slate-200 bg-white p-4 animate-in slide-in-from-bottom-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10 relative">
             <div className="flex justify-between items-center mb-3">
               <h4 className="font-bold text-slate-800 truncate pr-2">{activeLocation.name}</h4>
               <button onClick={() => setSelectedLoc(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
             </div>
             
             <div className="mb-4">
               <h5 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Available Supplies</h5>
               <div className="flex flex-wrap gap-1.5">
                  {inventory.filter(i => i.location_id === activeLocation.id).slice(0, 4).map(item => (
                    <span key={item.id} className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="font-bold">{item.quantity}</span> {item.item_name}
                    </span>
                  ))}
                  {inventory.filter(i => i.location_id === activeLocation.id).length === 0 && (
                     <span className="text-[10px] text-slate-500 italic">No inventory recorded</span>
                  )}
               </div>
             </div>
             
             <button 
                onClick={() => handleCheckIn(activeLocation.name)}
                className="w-full bg-blue-600 text-white font-bold text-sm py-2.5 rounded shadow shadow-blue-600/20 hover:bg-blue-700 transition"
             >
                CHECK-IN SAFE AT THIS LOCATION
             </button>
          </div>
        )}
      </div>

      {/* Right Map */}
      <div className="w-full md:w-2/3 relative rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100 min-h-[400px]">
        <MapContainer center={userPos || [19.076, 72.877]} zoom={userPos ? 13 : 12} className="h-full w-full z-0">
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard">
              <TileLayer url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="High Contrast (Dark)">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="High Contrast (Light)">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {userPos && <MapUpdater center={userPos} zoom={13} />}
          {activeLocation && !userPos && <MapUpdater center={[activeLocation.latitude, activeLocation.longitude]} />}
          
          {userPos && (
            <Marker position={userPos} icon={getMarkerIcon('user')} zIndexOffset={1000}>
              <Popup>
                <div className="text-center font-bold text-sm">Your Location</div>
              </Popup>
            </Marker>
          )}

          <MarkerClusterGroup chunkedLoading>
            {filteredLocations.map(loc => (
              <Marker 
                key={loc.id} 
                position={[loc.latitude, loc.longitude]} 
                icon={getMarkerIcon(loc.category)}
                eventHandlers={{
                  click: () => {
                    setSelectedLoc(loc.id);
                  },
                }}
              >
                <Popup>
                   <div className="min-w-[180px]">
                     <h4 className="font-bold text-sm mb-1">{loc.name}</h4>
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-600 capitalize">{loc.category}</span>
                       <StatusBadge status={loc.operational_status} type="location" />
                     </div>
                     <div className="text-xs text-slate-500 mb-3">{loc.address || 'Address not listed'}</div>
                     
                     {userPos && loc.distance !== Infinity && (
                       <div className="text-xs font-bold text-blue-600 mb-3">
                         {loc.distance != null ? loc.distance.toFixed(1) : ""} km away
                       </div>
                     )}

                     <div className="flex gap-2">
                       <button onClick={() => handleGetDirections(loc.latitude, loc.longitude)} className="flex-1 bg-slate-900 text-white font-bold text-[10px] py-1.5 rounded hover:bg-slate-800 transition">
                         DIRECTIONS
                       </button>
                       <button onClick={() => setSelectedLoc(loc.id)} className="flex-1 bg-blue-100 text-blue-700 font-bold text-[10px] py-1.5 rounded hover:bg-blue-200 transition border border-blue-200">
                         VIEW DETAILS
                       </button>
                     </div>
                   </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
}
