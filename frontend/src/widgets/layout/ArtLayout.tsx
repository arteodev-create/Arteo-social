import MainLayout from './MainLayout';
import { useAuth } from '@entities/session/model';
import PageHeader from './PageHeader';
import { useNavigate } from 'react-router-dom';

interface ArtGalleryLayoutProps {
    children: React.ReactNode;
}

const ArtGalleryLayout: React.FC<ArtGalleryLayoutProps & { title?: string; subtitle?: string }> = ({ children, title, subtitle }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <MainLayout layoutMode="standard">
            <div className="flex flex-col min-h-screen">
                {title && (
                    <PageHeader
                        title={title}
                        subtitle={subtitle}
                        showBackButton={true}
                        onBackClick={() => navigate(-1)}
                    />
                )}
                <div className="w-full">
                    {children}
                </div>
            </div>
        </MainLayout>
    );
};

export default ArtGalleryLayout;

