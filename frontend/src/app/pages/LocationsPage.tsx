import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Globe, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationPicker, type LocationResult } from '@shared/ui';
import { Button } from '@shared/ui';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin icon
const customIcon = L.divIcon({
  html: `<div style="
    width: 36px; height: 36px;
    background: black;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    cursor: pointer;
  "></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  className: '',
});

const POPULAR_LOCATIONS = [
  { name: 'Ho Chi Minh City', country: 'Vietnam', slug: 'Ho Chi Minh City, Vietnam', lat: 10.762622, lon: 106.660172 },
  { name: 'Lagos', country: 'Nigeria', slug: 'Lagos, Nigeria', lat: 6.524379, lon: 3.379206 },
  { name: 'New York', country: 'United States', slug: 'New York, United States', lat: 40.712776, lon: -74.005974 },
  { name: 'Seoul', country: 'South Korea', slug: 'Seoul, South Korea', lat: 37.566535, lon: 126.977969 },
  { name: 'London', country: 'United Kingdom', slug: 'London, United Kingdom', lat: 51.507351, lon: -0.127758 },
  { name: 'Tokyo', country: 'Japan', slug: 'Tokyo, Japan', lat: 35.689487, lon: 139.691706 },
];

const MapFlyTo: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 4, { duration: 1 });
  }, [lat, lon, map]);
  return null;
};

const LocationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number }>({ lat: 20, lon: 0 });

  const handleLocationSelect = (res: LocationResult | null) => {
    if (res) {
      setMapCenter({ lat: res.lat, lon: res.lon });
      setTimeout(() => {
        navigate(`/location/${encodeURIComponent(res.shortName)}`);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
      <Helmet>
        <title>{t('footer.locations')} | Arteo</title>
      </Helmet>      {/* Map header */}
      <div className="relative w-full h-[320px] bg-zinc-100 items-center justify-center">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lon]}
          zoom={2}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {POPULAR_LOCATIONS.map(loc => (
            <Marker 
              key={loc.name} 
              position={[loc.lat, loc.lon]} 
              icon={customIcon} 
              eventHandlers={{
                click: () => handleLocationSelect({
                  displayName: loc.name,
                  shortName: loc.slug,
                  countryCode: '',
                  lat: loc.lat,
                  lon: loc.lon,
                  placeId: Math.random()
                })
              }}
            />
          ))}
          <MapFlyTo lat={mapCenter.lat} lon={mapCenter.lon} />
        </MapContainer>

        {/* Back button overlay */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-[1001] bg-white shadow-none rounded-[8px]"
        >
          <ArrowLeft size={20} strokeWidth={2.5} className="text-black" />
        </Button>

        {/* Overlay Search Bar */}
        <div className="absolute inset-0 flex items-center justify-center z-[1001] px-6 pointer-events-none">
          <div className="w-full max-w-[500px] pointer-events-auto">
            <LocationPicker 
              onChange={handleLocationSelect}
              placeholder={t('onboarding.location_placeholder')}
              variant="borderless"
            />
          </div>
        </div>
      </div>      {/* Content */}
      <div className="max-w-[700px] mx-auto px-6 pb-20 mt-10">
        <div className="pb-8 border-b border-zinc-100 mb-8 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <MapPin size={24} className="text-black" />
              <h1 className="text-[24px] font-bold text-black tracking-tight">{t('footer.locations')}</h1>
           </div>
        </div>

        {/* Simplified Popular List */}
        <div className="divide-y divide-zinc-50 rounded-[8px] overflow-hidden">
          {POPULAR_LOCATIONS.map((loc) => (
            <Button
              key={loc.name}
              variant="ghost"
              onClick={() => navigate(`/location/${encodeURIComponent(loc.slug)}`)}
              className="w-full flex items-center justify-between p-8 bg-white hover:bg-zinc-50 transition-colors rounded-[8px] border-b border-zinc-50 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-[8px] bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <Globe size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[15px] font-bold text-black leading-tight">{loc.name}</p>
                  <p className="text-[12px] text-zinc-400 font-medium">{loc.country}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-zinc-200" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;

