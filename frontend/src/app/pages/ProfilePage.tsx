import React from 'react';
import { ProfileContent } from '@features/profile';
import { MODAL_IDS } from '@constants/modalIds';
import { useModal } from '../../contexts/ModalContext';
import MainLayout from '@widgets/layout/MainLayout';
import PageHeader from '@widgets/layout/PageHeader';
import { SEO } from '@shared/ui';

const ProfilePage: React.FC = () => {
  const { openModal } = useModal();
  const handleCreatePost = () => openModal(MODAL_IDS.CREATE_POST);

  return (
    <MainLayout onCreatePost={handleCreatePost}>
      <SEO
        title="Profile"
        description="View an Arteo creator profile, posts, media, replies, and social activity."
        keywords="Arteo profile, creator profile, social posts, creator network"
        type="profile"
      />
      <ProfileContent
        renderHeader={({ title, subtitle, centered, actions }) => (
          <PageHeader
            title={title}
            subtitle={subtitle}
            showBackButton
            size="small"
            centered={centered}
          >
            {actions}
          </PageHeader>
        )}
      />
    </MainLayout>
  );
};

export default ProfilePage;
