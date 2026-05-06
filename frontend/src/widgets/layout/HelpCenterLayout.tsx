import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '@shared/ui';
import { Logo } from '@shared/ui';
import { ARTEO_SOCIAL_LINKS, SocialLink } from '@constants/socialLinks';

interface HelpCenterLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  metaDescription?: string;
  keywords?: string;
  jsonLd?: object;
  sections?: { id: string; title: string }[];
}

const legalPages = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'About', href: '/about' },
  { label: 'Help', href: '/help/contact' },
];

const HelpCenterLayout: React.FC<HelpCenterLayoutProps> = ({
  children,
  pageTitle,
  metaDescription,
  keywords,
  jsonLd,
  sections = [],
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[var(--bg-primary)] flex flex-col lg:flex-row overflow-hidden transition-colors duration-300">
      <SEO
        title={pageTitle || 'Arteo Social'}
        description={metaDescription}
        keywords={keywords}
        jsonLd={jsonLd}
      />

      <div className="hidden lg:flex flex-col w-[300px] xl:w-[360px] flex-shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] h-full p-10 justify-between overflow-y-auto scrollbar-hide">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-4 mb-16 active:scale-95 transition-transform"
          >
            <Logo size={40} color="var(--text-primary)" />
            <span className="text-[22px] font-bold tracking-tighter text-[var(--text-primary)] font-display">Arteo</span>
          </button>

          <div className="mb-10">
            <p className="text-[13px] font-bold text-[var(--text-muted)] mb-4 font-readable">Legal</p>
            <nav className="space-y-1">
              {legalPages.map((page) => (
                <Link
                  key={page.href}
                  to={page.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[8px] text-[14px] font-bold transition-none active:bg-[var(--bg-primary)]/50 font-readable ${
                    location.pathname === page.href
                      ? 'bg-[var(--bg-primary)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {location.pathname === page.href && (
                    <motion.div
                      layoutId="legal-nav-indicator"
                      className="w-1 h-4 bg-[var(--text-primary)] rounded-[0px] flex-shrink-0"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {page.label}
                </Link>
              ))}
            </nav>
          </div>

          {sections.length > 0 && (
            <div>
              <p className="text-[13px] font-bold text-[var(--text-muted)] mb-4 font-readable">Contents</p>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-[13px] font-bold text-[var(--text-muted)] py-2 px-4 rounded-[8px] transition-none active:bg-[var(--bg-primary)] active:text-[var(--text-primary)] font-readable"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="mt-10 space-y-6">
          <div className="flex items-center gap-4">
            {ARTEO_SOCIAL_LINKS.map((link: SocialLink) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-300 hover:scale-110"
                title={link.name}
              >
                {link.icon(18)}
              </a>
            ))}
          </div>
          <p className="text-[12px] font-bold text-[var(--text-muted)] font-readable uppercase tracking-widest">
            (c) 2026 Arteo Platform
          </p>
        </div>
      </div>

      <div className="flex-1 bg-[var(--bg-primary)] h-full overflow-y-auto">
        <div className="lg:hidden sticky top-0 z-50 bg-[var(--bg-primary)]  border-b border-[var(--border-primary)]">
          <div className="px-6 h-[64px] flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 active:scale-95 transition-transform"
            >
              <Logo size={28} color="var(--text-primary)" />
              <span className="text-[18px] font-bold tracking-tighter text-[var(--text-primary)] font-display">Arteo</span>
            </button>
            <nav className="flex items-center gap-4">
              {legalPages.slice(0, 2).map((page) => (
                <Link
                  key={page.href}
                  to={page.href}
                  className={`text-[13px] font-bold transition-none ${
                    location.pathname === page.href
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {page.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-[720px] mx-auto px-6 md:px-12 xl:px-16 py-16 pb-40">
          {children}
        </div>
      </div>
    </div>
  );
};

export default HelpCenterLayout;
