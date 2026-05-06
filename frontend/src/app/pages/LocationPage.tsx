import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Grid3X3, Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import i18n from '@app/i18n';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { postApi } from '@features/post/api';
import { Post as GlobalPost } from '@entities/post/model';
import { useAuth } from '@entities/session/model';
import { Avatar } from '@shared/ui';
import { Button } from '@shared/ui';
import { Tabs } from '@shared/ui';
import { EmptyState } from '@shared/ui';
import { EMPTY_STATE_CODES } from '@constants/emptyStates';
import { LoadingSpinner } from '@shared/ui';

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
  "></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  className: '',
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}


const MapFlyTo: React.FC<{ lat: number; lon: number }> = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 13, { duration: 1.5 });
  }, [lat, lon, map]);
  return null;
};

const LocationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useAuth();

  const locationName = slug ? decodeURIComponent(slug) : '';

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [posts, setPosts] = useState<GlobalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'recent' | 'top'>('recent');
  const [postCount, setPostCount] = useState(0);  // Geocode location name to coordinates
  useEffect(() => {
    if (!locationName) return;
    const geocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`,
          { headers: { 'Accept-Language': i18n.language } }
        );
        const data: NominatimResult[] = await res.json();
        if (data.length > 0) {
          setCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        }
      } catch {
        // fallback: no map
      }
    };
    geocode();
  }, [locationName]);

  // Fetch posts at this location
  useEffect(() => {
    if (!locationName) return;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await postApi.getPosts({
            location: locationName,
            sort: tab === 'top' ? 'popular' : 'recent',
            limit: 30,
        });
        if (res.success) {
          const fetched = (res.data?.posts || []) as GlobalPost[];
          setPosts(fetched);
          setPostCount(Number(res.data?.pagination?.total || fetched.length));
        }
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [locationName, tab, token]);

  const postsWithMedia = posts.filter(p => p.media && p.media.length > 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans">
      <Helmet>
        <title>{locationName} | Arteo</title>
      </Helmet>      {/* Map banner */}
      <div className="relative w-full h-[220px] bg-zinc-100 overflow-hidden">
        {coords ? (
          <MapContainer
            center={[coords.lat, coords.lon]}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coords.lat, coords.lon]} icon={customIcon}>
              <Popup>{locationName}</Popup>
            </Marker>
            <MapFlyTo lat={coords.lat} lon={coords.lon} />
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={32} className="text-zinc-200 mx-auto mb-2" />
              <p className="text-zinc-300 text-sm font-medium">{t('location_page.loading_map')}</p>
            </div>
          </div>
        )}

        {/* Back button overlay */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-[1000] bg-[var(--bg-primary)]  rounded-[8px] shadow-md hover:bg-[var(--bg-secondary)]"
        >
          <ArrowLeft size={18} strokeWidth={2.5} className="text-[var(--text-primary)]" />
        </Button>
      </div>      {/* Location info */}
      <div className="max-w-[640px] mx-auto px-4">
        <div className="py-5 border-b border-[var(--border-primary)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={18} className="text-[var(--text-primary)]" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[var(--text-primary)] tracking-tight leading-tight">{locationName}</h1>
              <p className="text-[13px] text-zinc-500 font-medium mt-0.5">
                {t('location_page.posts_count', { count: postCount })}
              </p>
            </div>
          </div>
        </div>        {/* Tabs */}
        <Tabs
            activeTab={tab}
            onChange={(t) => setTab(t as 'recent' | 'top')}
            tabs={[
                { id: 'recent', label: t('location_page.tab_recent'), icon: Clock },
                { id: 'top', label: t('location_page.tab_top'), icon: Grid3X3 },
            ]}
            className="mt-2"
        />        {/* Posts grid */}
        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] w-full">
                <LoadingSpinner size="lg" label="Arteo is finding posts in this area..." />
            </div>
          ) : postsWithMedia.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {postsWithMedia.map((post, i) => (
                <motion.div
                  key={post.uuid}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative aspect-square bg-zinc-50 overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/p/${post.uuid}`)}
                >
                  <img
                    src={post.media![0].url}
                    alt={post.content || ''}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-4 text-white text-sm font-bold">
                      <span>Likes {post.stats?.likeCount || 0}</span>
                      <span>Reposts {post.stats?.repostCount || 0}</span>
                    </div>
                  </div>
                  {/* Multi-media indicator */}
                  {post.media!.length > 1 && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-black/50 rounded-sm flex items-center justify-center">
                      <Grid3X3 size={10} className="text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-10">
                <EmptyState
                    type={EMPTY_STATE_CODES.SEARCH_EMPTY}
                    title={t('location_page.no_posts')}
                    description={locationName}
                />
            </div>
          )}
        </div>

        {/* Posts without media (text-only) */}
        {!loading && posts.filter(p => !p.media?.length).length > 0 && postsWithMedia.length === 0 && (
          <div className="space-y-3 pb-6">
            {posts.map((post) => (
              <div
                key={post.uuid}
                className="border border-zinc-100 rounded-[8px] p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => navigate(`/p/${post.uuid}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar 
                    src={post.user?.avatar} 
                    username={post.user?.username} 
                    size="sm"
                  />
                  <div>
                    <p className="text-[13px] font-bold text-black">{post.user?.fullName || post.user?.username}</p>
                    <p className="text-[11px] text-zinc-400">@{post.user?.username}</p>
                  </div>
                </div>
                <p className="text-[14px] text-zinc-700 leading-relaxed line-clamp-3">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPage;

