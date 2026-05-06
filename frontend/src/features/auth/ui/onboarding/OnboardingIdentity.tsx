import React, { useState } from 'react';
import { useAuth } from '@entities/session/model';
import { IdentityService } from '../../../../services';
import MinimalInput from '../MinimalInput';
import { Button } from '@shared/ui';
import { toast } from 'sonner';

interface OnboardingIdentityProps {
    onNext: () => void;
}

const OnboardingIdentity: React.FC<OnboardingIdentityProps> = ({ onNext }) => {
    const { user, refreshUser } = useAuth();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await IdentityService.updateProfile({ fullName, bio });
            await refreshUser();
            onNext();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                <div className="space-y-1.5">
                    <p className="text-[11px] font-black text-zinc-500 px-2">Full name</p>
                    <MinimalInput
                        placeholder="Your display name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <p className="text-[11px] font-black text-zinc-500 px-2">Bio</p>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell people a little about yourself..."
                        rows={4}
                        className="w-full bg-black border border-zinc-900 text-white text-[15px] font-bold rounded-[8px] px-6 py-4 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-all resize-none"
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={loading || !fullName.trim()}
                    loading={loading}
                    variant="primary"
                    className="w-full h-16 rounded-[8px] text-[15px] font-bold"
                >
                    Continue
                </Button>
            </div>
        </form>
    );
};

export default OnboardingIdentity;
