import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
    X, 
    Camera, 
    MapPin,
} from '@phosphor-icons/react';
import { Avatar } from '@shared/ui';
import { User } from '@entities/user/model';
import { identityApi } from '@entities/user/api';
import { useAuth } from '@entities/session/model';
import { getImageUrl } from '@shared/lib';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { BaseModal } from '@shared/ui';
import { LocationPicker, type LocationResult } from '@shared/ui';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdate: (updatedUser: User) => void;
    zIndex?: number;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate, zIndex }) => {
    const { t } = useTranslation();
    const { updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        bio: '',
        website: '',
        location: '',
        headline: '',
        company: '',
        isPrivate: false,
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    
    // Location Pro States
    const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
    const [showLocationResults, setShowLocationResults] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                fullName: user.fullName || '',
                bio: user.bio || '',
                website: user.website || '',
                location: user.location || '',
                headline: user.headline || '',
                company: user.company || '',
                isPrivate: !!user.isPrivate,
            });
            setAvatarPreview(getImageUrl(user.avatar));
        }
    }, [isOpen, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setAvatarFile(file);
            setAvatarPreview(preview);
        }
    };

    const handleLocationSelect = (res: LocationResult | null) => {
        setFormData(prev => ({ ...prev, location: res ? res.shortName : '' }));
        setShowLocationResults(false);
    };

    const handleLocationResultsFetch = (results: LocationResult[]) => {
        setLocationResults(results);
        setShowLocationResults(results.length > 0);
    };

    const handleSubmit = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const payload: any = { ...formData, avatar: avatarFile || undefined };
            const { success, data } = await identityApi.updateProfile(payload);
            if (success && data) {
                toast.success('Arteo identity synchronized.');
                const updatedUser = (data as any).user || (data as User);
                updateUser(updatedUser);
                onUpdate(updatedUser);
                onClose();
            }
        } catch (error) {
            toast.error('System identity error.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            zIndex={zIndex}
            maxWidth="620px"
            closeOnOutsideClick={!loading}
            backdropStyle="dim"
            animationType="fadeScale"
            className="flex flex-col overflow-hidden h-fit max-h-[90vh]"
        >
            {/* Pro Header - Identical to CreatePostModal Vibe */}
            <div className="flex items-center justify-between px-8 py-5 border-b-2 border-[var(--border-primary)] bg-[var(--bg-primary)] sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-[var(--bg-secondary)] rounded-[8px] transition-all active:scale-90"
                    >
                        <X size={24} weight="bold" className="text-[var(--text-primary)]" />
                    </button>
                    <span className="text-[17px] font-bold tracking-tight">{t('edit_profile.title')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[var(--bg-secondary)] rounded-[8px] border border-[var(--border-primary)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Platinum Core</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar bg-[var(--bg-primary)]">
                {/* Profile Grid - Mirroring ThreadItem Layout */}
                <div className="flex gap-6 relative">
                    {/* Left Column: Avatar Interaction */}
                    <div className="flex flex-col items-center w-[64px] flex-shrink-0">
                        <div 
                            className="relative group cursor-pointer"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            <Avatar 
                                src={avatarPreview || undefined} 
                                username={user.username} 
                                seed={user.uuid}
                                size="lg" 
                                className="ring-2 ring-[var(--border-primary)] shadow-none transition-all group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <Camera size={20} weight="fill" className="text-white" />
                            </div>
                        </div>
                        <div className="w-[2px] flex-1 bg-[var(--border-primary)] my-4"></div>
                        <input type="file" ref={avatarInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    {/* Right Column: Fields */}
                    <div className="flex-1 space-y-12">
                        {/* Section 1: Identity */}
                        <div className="space-y-10">
                            <ProInput 
                                label="Display Name" 
                                name="fullName" 
                                value={formData.fullName} 
                                onChange={handleInputChange} 
                                placeholder="Your full name"
                            />

                            <div className="relative">
                                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] mb-2 block">
                                    Biography
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className="w-full bg-transparent border-b border-[var(--border-primary)] py-3 text-[16px] font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] placeholder:font-medium resize-none h-28 leading-relaxed tracking-tight"
                                    placeholder="A few lines about yourself..."
                                    maxLength={160}
                                />
                                <div className="absolute bottom-0 right-0 text-[10px] font-black text-[var(--text-muted)] tracking-tight translate-y-full pt-1">
                                    {formData.bio.length}/160
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pro Details */}
                        <div className="grid grid-cols-2 gap-10">
                            <ProInput 
                                label="Title" 
                                name="headline" 
                                value={formData.headline} 
                                onChange={handleInputChange} 
                                placeholder="Software Engineer"
                            />
                            <ProInput 
                                label="Organization" 
                                name="company" 
                                value={formData.company} 
                                onChange={handleInputChange} 
                                placeholder="Arteo Foundation"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                            <div className="col-span-1">
                                <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 block">
                                    Location
                                </label>
                                <LocationPicker 
                                    value={formData.location}
                                    onChange={handleLocationSelect}
                                    onResultsFetch={handleLocationResultsFetch}
                                    variant="borderless"
                                    placeholder="Find your city..."
                                />
                            </div>
                            <ProInput 
                                label="Website" 
                                name="website" 
                                value={formData.website} 
                                onChange={handleInputChange} 
                                placeholder="yourspace.com"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pro Footer - Mirroring CreatePostToolbar */}
            <div className="px-8 py-6 border-t-2 border-[var(--border-primary)] bg-[var(--bg-primary)] flex items-center justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-12 py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[8px] font-bold text-[15px] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-none shadow-black/10"
                >
                    {loading ? 'Syncing...' : 'Save Profile'}
                </button>
            </div>

            <AnimatePresence>
                {showLocationResults && (
                    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLocationResults(false)} />
                        <div className="relative bg-[var(--bg-primary)] w-full max-w-[340px] rounded-[8px] overflow-hidden flex flex-col border border-[var(--border-primary)] shadow-[0_32px_64px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-5 border-b-2 border-[var(--border-primary)] flex justify-between items-center bg-[var(--bg-primary)]">
                                <span className="font-black text-[var(--text-primary)] uppercase tracking-widest text-[13px]">Confirm Location</span>
                                <button onClick={() => setShowLocationResults(false)} className="text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] p-1 rounded-[8px]"><X size={20} weight="bold" /></button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {locationResults.map((result, i) => (
                                    <button
                                        key={result.placeId}
                                        onClick={() => handleLocationSelect(result)}
                                        className={`w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-[var(--bg-secondary)] transition-colors ${i !== locationResults.length - 1 ? 'border-b border-[var(--border-primary)]' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-[8px] bg-[var(--bg-secondary)] flex items-center justify-center shrink-0">
                                            <MapPin size={20} className="text-[var(--text-primary)]" weight="bold" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-black text-[var(--text-primary)] truncate">{result.shortName}</p>
                                            <p className="text-[11px] text-[var(--text-muted)] font-bold truncate uppercase tracking-tighter">{result.displayName.split(',').slice(0, 3).join(',')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </BaseModal>
    );
};

const ProInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}> = ({ label, name, value, onChange, placeholder }) => (
    <div className="relative group flex flex-col">
        <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em] mb-2 block transition-colors group-focus-within:text-[var(--text-primary)]">
            {label}
        </label>
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-transparent border-b border-[var(--border-primary)] py-3 text-[16px] font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)] placeholder:font-medium tracking-tight"
            placeholder={placeholder}
        />
    </div>
);

export default EditProfileModal;



