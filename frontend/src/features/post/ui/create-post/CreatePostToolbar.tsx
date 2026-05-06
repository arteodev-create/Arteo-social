import * as Icons from "@phosphor-icons/react";
import { AddThreadIcon } from '@shared/ui';
import { LoadingSpinner } from '@shared/ui';

interface CreatePostToolbarProps {
    onImageClick: () => void;
    onGifClick: () => void;
    onPollClick: () => void;
    onEmojiClick: () => void;
    onLocationClick: () => void;
    onSelfDestructClick: () => void;
    isSelfDestruct: boolean;
    showAddThread: boolean;
    onAddThread: () => void;
    onSubmit: () => void;
    loading: boolean;
    canSubmit: boolean;
}

const CreatePostToolbar: React.FC<CreatePostToolbarProps> = ({
    onImageClick,
    onGifClick,
    onPollClick,
    onEmojiClick,
    onLocationClick,
    onSelfDestructClick,
    isSelfDestruct,
    showAddThread,
    onAddThread,
    onSubmit,
    loading,
    canSubmit
}) => {
    return (
        <div className="px-6 h-[72px] flex items-center justify-between border-t border-black bg-[var(--bg-primary)] shrink-0 mt-auto">
            <div className="flex items-center">
                <button onClick={onImageClick} className="h-10 w-10 border border-r-0 border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center">
                    <Icons.Image size={22} weight="bold" />
                </button>
                <button onClick={onGifClick} className="h-10 w-10 border border-r-0 border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center">
                    <Icons.Gif size={26} weight="bold" />
                </button>
                <button onClick={onPollClick} className="h-10 w-10 border border-r-0 border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center">
                    <Icons.ListBullets size={22} weight="bold" />
                </button>
                <button onClick={onEmojiClick} className="h-10 w-10 border border-r-0 border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center">
                    <Icons.Smiley size={22} weight="bold" />
                </button>
                <button onClick={onLocationClick} className="h-10 w-10 border border-r-0 border-black text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center">
                    <Icons.MapPin size={22} weight="bold" />
                </button>
                <button onClick={onSelfDestructClick} className={`h-10 w-10 border border-black transition-colors flex items-center justify-center ${isSelfDestruct ? 'bg-black text-white' : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}>
                    <Icons.Clock size={22} weight="bold" />
                </button>

                {showAddThread && (
                    <button onClick={onAddThread} className="ml-3 w-10 h-10 flex items-center justify-center border border-black bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                        <AddThreadIcon size={18} />
                    </button>
                )}
            </div>

            <button
                onClick={onSubmit}
                disabled={loading || !canSubmit}
                className={`px-8 h-[40px] border border-black text-[15px] font-black flex items-center justify-center min-w-[100px] transition-colors
                    ${loading || !canSubmit
                        ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                        : 'bg-black text-white hover:bg-black'
                    }`}
            >
                {loading ? <LoadingSpinner size="sm" /> : 'Post'}
            </button>
        </div>
    );
};

export default CreatePostToolbar;
