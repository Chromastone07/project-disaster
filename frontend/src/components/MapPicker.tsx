import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const pickerIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0f172a" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

interface MapPickerProps {
  value: { lat: number; lng: number } | null;
  onChange: (pos: { lat: number; lng: number }) => void;
}

const LocationMarker = ({ position, setPosition }: { position: any, setPosition: any }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : <Marker position={position} icon={pickerIcon} />;
};

export default function MapPicker({ value, onChange }: MapPickerProps) {
  const handleGeolocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  return (
    <div className="relative h-96 w-full rounded-md border border-gray-300 overflow-hidden">
      <button 
        type="button"
        onClick={handleGeolocation}
        className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded shadow hover:bg-gray-100 text-sm font-medium"
      >
        📍 Use My Location
      </button>
      <MapContainer center={[19.076, 72.877]} zoom={13} className="h-full w-full">
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
        <LocationMarker position={value} setPosition={onChange} />
      </MapContainer>
      <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 border-t border-gray-300">
        Selected Coordinates: {value ? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}` : 'Click on map or use location'}
      </div>
    </div>
  );
}
