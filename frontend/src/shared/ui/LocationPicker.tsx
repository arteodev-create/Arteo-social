import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, X } from '@phosphor-icons/react';
import { LoadingSpinner } from '@shared/ui';
import { useTranslation } from 'react-i18next';

export interface LocationResult {
  displayName: string;
  shortName: string;
  countryCode: string;
  lat: number;
  lon: number;
  placeId: number;
}

interface LocationPickerProps {
  value?: string;
  onChange: (location: LocationResult | null) => void;
  onResultsFetch?: (results: LocationResult[]) => void;
  placeholder?: string;
  variant?: 'default' | 'borderless';
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, onResultsFetch, placeholder, variant = 'default' }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LocationResult | null>(null);
  const debounceRef = useRef<any>(null);

  const buildShortName = (feature: any): string => {
    const p = feature.properties;
    const parts: string[] = [];
    if (p.city || p.town || p.village) parts.push(p.city || p.town || p.village);
    if (p.country) parts.push(p.country);
    return parts.length > 0 ? parts.join(', ') : p.name || '';
  };

  const lastQueryRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2 || q === lastQueryRef.current) {
      if (onResultsFetch && q !== lastQueryRef.current) onResultsFetch([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    lastQueryRef.current = q;

    try {
      // Switched to Photon (Komoot) API for better CORS and performance
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6`,
        { signal: abortControllerRef.current.signal }
      );

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      const mapped: LocationResult[] = (data.features || []).map((f: any) => ({
        displayName: [f.properties.name, f.properties.city, f.properties.country].filter(Boolean).join(', '),
        shortName: buildShortName(f),
        countryCode: (f.properties.countrycode || '').toUpperCase(),
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        placeId: f.properties.osm_id,
      }));
      if (onResultsFetch) onResultsFetch(mapped);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (onResultsFetch) onResultsFetch([]);
      }
    } finally {
      setLoading(false);
    }
  }, [onResultsFetch]);

  useEffect(() => {
    if (selected) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      search(query);
    }, 800); // Increased debounce to 800ms
    return () => {
      clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [query, search, selected]);

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    if (onResultsFetch) onResultsFetch([]);
    onChange(null);
  };

  return (
    <div className="relative w-full">
      <div className={`relative bg-[var(--bg-secondary)]/50 ${variant === 'borderless' ? 'border-none shadow-none' : `border border-[var(--border-primary)] shadow-sm`} rounded-[8px] p-6 transition-all group focus-within:border-[var(--text-primary)]/30 focus-within:bg-[var(--bg-primary)]`}>
        <label className="text-[11px] font-bold block mb-2 text-[var(--text-muted)] group-focus-within:text-[var(--text-primary)]">
          {t('onboarding.location_label')}
        </label>
        <div className="flex items-center gap-4">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <MapPin size={22} className="text-[var(--text-muted)] shrink-0" weight="bold" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            placeholder={placeholder || t('onboarding.location_placeholder')}
            className="w-full bg-transparent border-none focus:outline-none text-[15px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={handleClear} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shrink-0">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="px-6 mt-1.5 text-[10px] text-[var(--text-muted)] font-medium tracking-tight">
        {selected ? selected.shortName : t('onboarding.location_hint')}
      </p>
    </div>
  );
};

export default LocationPicker;
