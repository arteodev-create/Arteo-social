import React from 'react';
import { AlgorithmDetail } from '@features/algorithm';
import MainLayout from '@widgets/layout/MainLayout';

const AlgorithmDetailPage: React.FC = () => (
  <MainLayout layoutMode="wide">
    <AlgorithmDetail />
  </MainLayout>
);

export default AlgorithmDetailPage;
