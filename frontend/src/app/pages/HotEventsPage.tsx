import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Icons } from '@shared/ui';
import { HotEventsContent } from '@features/hot-event';
import MainLayout from '@widgets/layout/MainLayout';
import PageHeader from '@widgets/layout/PageHeader';

const HotEventsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <MainLayout layoutMode="standard">
            <Helmet>
                <title>{t('titles.hot_events')} | Arteo</title>
            </Helmet>

            <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
                <PageHeader
                    title={
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-[8px] bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] shadow-sm shrink-0">
                                <Icons.Trending size={22} weight="light" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[20px] font-black tracking-tight leading-none">{t('hot_events.header_title')}</span>
                                <span className="text-[11px] text-[var(--text-muted)] font-bold mt-1">{t('hot_events.realtime_analysis')}</span>
                            </div>
                        </div>
                    }
                    showBackButton={false}
                />

                <HotEventsContent />
            </div>
        </MainLayout>
    );
};

export default HotEventsPage;
