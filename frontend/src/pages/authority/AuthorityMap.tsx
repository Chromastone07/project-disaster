import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useAppStore } from '../../store/appStore';
import L from 'leaflet';
import StatusBadge from '../../components/StatusBadge';

// Helper for map centering
function MapUpdater({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
}

// Icons
const reportIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>`,
  iconSize: [24, 24], iconAnchor: [12, 24], popupAnchor: [0, -24]
});

const volunteerIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22]
});

const shelterIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`,
  iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22]
});

const civicIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22]
});

export default function AuthorityMap() {
  const { reports, locations, users, civic_issues } = useAppStore();
  const volunteers = users.filter(u => u.role === 'volunteer' && u.latitude);

  const [osmLocations, setOsmLocations] = useState<any[]>([]);

  React.useEffect(() => {
    const loadOSMAmenities = async () => {
      // Fetch within bounding box of roughly Mumbai area (or could be global, but better to keep it restricted)
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](19.0,72.8,19.2,73.0);
          node["amenity"="police"](19.0,72.8,19.2,73.0);
          node["amenity"="fire_station"](19.0,72.8,19.2,73.0);
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
    loadOSMAmenities();
  }, []);

  const allLocations = [...locations, ...osmLocations];

  const [visibleLayers, setVisibleLayers] = useState({
    reports: true,
    volunteers: true,
    locations: true,
    civic: true
  });

  return (
    <div className="col-span-1 md:col-span-3 h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center z-10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Live Global Operations Map</h3>
        
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input type="checkbox" checked={visibleLayers.reports} onChange={e => setVisibleLayers(v => ({...v, reports: e.target.checked}))} />
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Incidents
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input type="checkbox" checked={visibleLayers.volunteers} onChange={e => setVisibleLayers(v => ({...v, volunteers: e.target.checked}))} />
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Volunteers
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input type="checkbox" checked={visibleLayers.locations} onChange={e => setVisibleLayers(v => ({...v, locations: e.target.checked}))} />
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Shelters/Medical
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
            <input type="checkbox" checked={visibleLayers.civic} onChange={e => setVisibleLayers(v => ({...v, civic: e.target.checked}))} />
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Civic Issues
          </label>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <MapContainer center={[19.076, 72.877]} zoom={11} className="h-full w-full">
          <TileLayer url={import.meta.env.VITE_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} />
          
          <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
            {/* Incident Reports */}
            {visibleLayers.reports && reports.filter(r => ['active', 'unreviewed', 'in_progress'].includes(r.status)).map(report => (
              <Marker key={report.id} position={[report.latitude, report.longitude]} icon={reportIcon}>
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{report.id}</span>
                      <StatusBadge status={report.severity} type="severity" />
                    </div>
                    <div className="mb-2"><StatusBadge status={report.category} /></div>
                    <p className="text-sm text-slate-800 font-medium mb-2">{report.description}</p>
                    <div className="text-[10px] text-slate-400 border-t pt-2 border-slate-100">
                      Reported: {new Date(report.created_at).toLocaleString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Volunteers */}
            {visibleLayers.volunteers && volunteers.map(vol => (
              <Marker key={vol.id} position={[vol.latitude!, vol.longitude!]} icon={volunteerIcon}>
                <Popup>
                  <div className="min-w-[150px] text-center">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                       {vol.name.charAt(0)}
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">{vol.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Volunteer</span>
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-1 rounded font-mono border border-slate-100">
                       Score: {vol.score}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Locations */}
            {visibleLayers.locations && allLocations.map(loc => (
              <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={shelterIcon}>
                <Popup>
                  <div className="min-w-[180px]">
                    <h4 className="font-bold text-sm mb-1">{loc.name}</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-600 capitalize">{loc.category}</span>
                      <StatusBadge status={loc.operational_status} type="location" />
                    </div>
                    <div className="text-xs text-slate-500 mb-2">{loc.address || 'Address not listed'}</div>
                    <div className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded inline-block">
                      Capacity: {loc.capacity}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Civic Issues */}
            {visibleLayers.civic && civic_issues.filter(c => ['open', 'acknowledged', 'in_progress'].includes(c.status)).map(civic => (
              <Marker key={civic.id} position={[civic.latitude, civic.longitude]} icon={civicIcon}>
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex justify-between items-start mb-2">
                       <span className="font-mono text-xs font-bold text-slate-500">{civic.id}</span>
                       <StatusBadge status={civic.status} />
                    </div>
                    <div className="mb-2"><StatusBadge status={civic.category} /></div>
                    <p className="text-sm text-slate-800 font-medium mb-2">{civic.description}</p>
                    <div className="text-[10px] text-slate-400 border-t pt-2 border-slate-100">
                      Reported: {new Date(civic.created_at).toLocaleString()}
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
