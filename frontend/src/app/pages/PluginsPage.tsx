import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PluginsList } from '@features/plugin';
import MainLayout from '@widgets/layout/MainLayout';
import PageHeader from '@widgets/layout/PageHeader';

const PluginsPage: React.FC = () => (
  <MainLayout layoutMode="wide">
    <Helmet>
      <title>Arteo Library | Arteo</title>
    </Helmet>
    <PluginsList
      renderHeader={({ title, showBackButton }) => (
        <PageHeader title={title} showBackButton={showBackButton} />
      )}
    />
  </MainLayout>
);

export default PluginsPage;
