import React, { useState, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import { useAuth } from '@entities/session/model';
import { IdentityService } from '../../../../services';
import { toast } from 'sonner';
import { Button } from '@shared/ui';
import { Avatar } from '@shared/ui';

interface OnboardingAvatarProps {
    onNext: () => void;
}

const OnboardingAvatar: React.FC<OnboardingAvatarProps> = ({ onNext }) => {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image is too large. Maximum size is 5MB.');
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            onNext();
            return;
        }

        setLoading(true);
        try {
            await IdentityService.updateProfile({ avatar: selectedFile });
            await refreshUser();
            onNext();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 flex flex-col items-center">
            <div className="relative group">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-44 h-44 rounded-[8px] border border-dashed border-zinc-800 bg-zinc-900/50 flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:border-white/20 hover:bg-zinc-900 ${previewUrl ? 'border-solid border-zinc-700' : ''}`}
                >
                    {previewUrl ? (
                        <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                        <Avatar seed={user?.uuid} username={user?.username} size={176} className="w-full h-full" />
                    )}
                </div>

                {previewUrl && !loading && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUrl(null);
                            setSelectedFile(null);
                        }}
                        className="absolute -top-1 -right-1 w-10 h-10 bg-white text-black rounded-[8px] flex items-center justify-center shadow-none border border-black hover:scale-110 transition-all active:scale-95"
                    >
                        <X size={18} weight="bold" />
                    </button>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            <div className="w-full space-y-4">
                <Button
                    onClick={handleUpload}
                    disabled={loading}
                    loading={loading}
                    variant="primary"
                    className="w-full h-16 rounded-[8px] text-[15px] font-bold"
                >
                    {selectedFile ? 'Save and continue' : 'Skip this step'}
                </Button>

                {!selectedFile && (
                    <p className="text-center text-[12px] text-zinc-600 font-bold px-4 leading-relaxed">
                        You can update your profile photo later from account settings.
                    </p>
                )}
            </div>
        </div>
    );
};

export default OnboardingAvatar;
