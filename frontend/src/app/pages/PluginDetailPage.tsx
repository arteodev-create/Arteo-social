import React from 'react';
import { PluginDetail } from '@features/plugin';
import MainLayout from '@widgets/layout/MainLayout';

const PluginDetailPage: React.FC = () => (
  <MainLayout layoutMode="wide">
    <PluginDetail />
  </MainLayout>
);

export default PluginDetailPage;
