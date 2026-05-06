import React from 'react';
import { PluginStudio } from '@features/plugin';
import MainLayout from '@widgets/layout/MainLayout';

const PluginStudioPage: React.FC = () => (
  <MainLayout layoutMode="full">
    <PluginStudio />
  </MainLayout>
);

export default PluginStudioPage;
