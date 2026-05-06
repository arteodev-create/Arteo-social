import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import HelpCenterLayout from '@widgets/layout/HelpCenterLayout';

const Privacy: React.FC = () => {
  const { t } = useTranslation();

  const sections = useMemo(() => [
    { id: 'intro', title: t('privacy_page.sections.intro.title') },
    { id: 'collection', title: t('privacy_page.sections.collection.title') },
    { id: 'security', title: t('privacy_page.sections.security.title') },
    { id: 'contact', title: t('privacy_page.sections.contact.title') },
  ], [t]);

  const contentKeys = ['intro', 'collection', 'security', 'contact'] as const;

  return (
    <HelpCenterLayout
      pageTitle={t('privacy_page.title')}
      metaDescription={t('privacy_page.subtitle')}
      sections={sections}
    >
      <Helmet>
        <title>{t('privacy_page.title')} | Arteo</title>
      </Helmet>

      {/* Hero */}
      <div className="mb-14 pb-14 border-b border-[var(--border-primary)]">
        <h1 className="text-[32px] font-bold tracking-tighter text-[var(--text-primary)] leading-tight font-display mb-4">
           {t('privacy_page.title')}
        </h1>
        <p className="text-[16px] text-[var(--text-muted)] font-light leading-relaxed font-readable max-w-[520px]">
          {t('privacy_page.subtitle')}
        </p>
        <p className="mt-6 text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
          {t('privacy_page.last_updated')}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {contentKeys.map((key) => (
          <section key={key} id={key} className="scroll-mt-24">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-4 tracking-tight font-display">
              {t(`privacy_page.sections.${key}.title`)}
            </h2>
            <div className="space-y-4">
              <p className="text-[15px] text-[var(--text-muted)] leading-relaxed font-light font-readable">
                {t(`privacy_page.sections.${key}.content`)}
              </p>
              
              {/* Items List (if any) */}
              {Array.isArray(t(`privacy_page.sections.${key}.items`, { returnObjects: true })) && (
                <ul className="space-y-2 pt-2">
                  {(t(`privacy_page.sections.${key}.items`, { returnObjects: true }) as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-[8px] w-[4px] h-[4px] rounded-[8px] bg-zinc-300 dark:bg-zinc-700 flex-shrink-0" />
                      <span className="text-[14px] text-[var(--text-muted)] leading-relaxed font-light font-readable">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-16 pt-8 border-t border-[var(--border-primary)]">
        <p className="text-[12px] text-[var(--text-muted)]">
          {t('privacy_page.footer_note')}
        </p>
      </div>
    </HelpCenterLayout>
  );
};

export default Privacy;

