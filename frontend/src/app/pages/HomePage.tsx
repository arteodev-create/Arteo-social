import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HomeFeed } from '@features/feed';
import { useAlgorithms } from '@features/algorithm/model/AlgorithmContext';
import { useAuthStore } from '@entities/session/model';
import { MODAL_IDS } from '@constants/modalIds';
import { useModal } from '../../contexts/ModalContext';
import MainLayout from '@widgets/layout/MainLayout';
import FeedHeader from '@widgets/layout/FeedHeader';
import { SEO } from '@shared/ui';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { setActiveAlgoUuid } = useAlgorithms();
  const { showRenewalNotice, setShowRenewalNotice } = useAuthStore();
  const { openModal } = useModal();

  useEffect(() => {
    if (showRenewalNotice) {
      openModal(MODAL_IDS.RENEWAL_NOTICE, {
        onClose: () => setShowRenewalNotice(false)
      });
      setShowRenewalNotice(false);
    }
  }, [showRenewalNotice, openModal, setShowRenewalNotice]);

  return (
    <MainLayout>
      <SEO
        title={t('titles.home') || 'Home'}
        description="Arteo is a fast social feed for creators, communities, and algorithmic discovery."
        keywords="Arteo, social feed, creator network, algorithmic feed, social platform"
      />

      <FeedHeader
        onAlgoChange={(algoUuid?: string) => {
          setActiveAlgoUuid(algoUuid ?? null);
        }}
      />

      <HomeFeed />
    </MainLayout>
  );
};

export default HomePage;
