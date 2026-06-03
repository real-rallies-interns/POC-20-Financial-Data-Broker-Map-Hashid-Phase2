"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons based on plant type
const getIcon = (type: string, status: string) => {
  let color = '#38BDF8'; // default cyan
  if (status === 'Offline') color = '#ef4444'; // red
  else if (status === 'Maintenance') color = '#eab308'; // yellow
  else if (['Coal', 'Gas'].includes(type)) color = '#818CF8'; // indigo for brown energy
  else color = '#10b981'; // green for renewable

  const markerHtmlStyles = `
    background-color: ${color};
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    left: -0.75rem;
    top: -0.75rem;
    position: relative;
    border-radius: 3rem 3rem 0;
    transform: rotate(45deg);
    border: 1px solid #FFFFFF;
    box-shadow: 0 0 10px ${color};
  `;

  return L.divIcon({
    className: "custom-pin",
    iconAnchor: [0, 24],
    popupAnchor: [0, -36],
    html: `<span style="${markerHtmlStyles}" />`
  });
};

const MapUpdater = ({ plants }: { plants: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (plants.length > 0) {
      const bounds = L.latLngBounds(plants.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [plants, map]);
  return null;
};

export default function Map({ plants }: { plants: any[] }) {
  return (
    <MapContainer center={[38.0, -97.0]} zoom={4} style={{ height: '100%', width: '100%', backgroundColor: '#030712' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {plants.map((plant) => (
        <Marker key={plant.id} position={[plant.lat, plant.lng]} icon={getIcon(plant.type, plant.status)}>
          <Popup className="custom-popup border-0 p-0 m-0 bg-transparent">
            <div className="bg-[#0B1117] text-white p-3 rounded border border-[#1F2937] min-w-[200px]">
              <h3 className="font-bold text-[#38BDF8] border-b border-[#1F2937] pb-1 mb-2">{plant.name}</h3>
              <div className="space-y-1">
                <p className="text-sm text-slate-300 flex justify-between"><span>Type:</span> <span className="font-semibold">{plant.type}</span></p>
                <p className="text-sm text-slate-300 flex justify-between"><span>Capacity:</span> <span className="font-semibold">{plant.capacity_mw} MW</span></p>
                <p className="text-sm flex justify-between">
                  <span className="text-slate-300">Status:</span> 
                  <span className={`font-semibold ${plant.status === 'Operational' ? 'text-green-400' : plant.status === 'Maintenance' ? 'text-yellow-400' : 'text-red-400'}`}>{plant.status}</span>
                </p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <MapUpdater plants={plants} />
    </MapContainer>
  );
}
