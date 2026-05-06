import React from 'react';
import { AlgorithmStudio } from '@features/algorithm';
import MainLayout from '@widgets/layout/MainLayout';

const AlgorithmStudioPage: React.FC = () => (
  <MainLayout layoutMode="full">
    <AlgorithmStudio />
  </MainLayout>
);

export default AlgorithmStudioPage;
