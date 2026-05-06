import React from 'react';
import { AlgorithmsList } from '@features/algorithm';
import MainLayout from '@widgets/layout/MainLayout';
import PageHeader from '@widgets/layout/PageHeader';
import { SEO } from '@shared/ui';

const AlgorithmsPage: React.FC = () => (
  <MainLayout layoutMode="wide">
    <SEO
      title="Algorithms"
      description="Browse Arteo feed algorithms for discovery, freshness, creator mix, market watch, learning, and focused social timelines."
      keywords="Arteo algorithms, feed ranking, social discovery, creator mix, AI feed"
    />
    <AlgorithmsList
      renderHeader={({ title, showBackButton }) => (
        <PageHeader title={title} showBackButton={showBackButton} />
      )}
    />
  </MainLayout>
);

export default AlgorithmsPage;
