import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SEO } from '@shared/ui';
import { Logo } from '@shared/ui';

const About: React.FC = () => {
    const { t } = useTranslation();

    const faqItems = t('newsroom.faq', { returnObjects: true }) as Array<{ question: string; answer: string }>;

    const newsroomSchema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": t('newsroom.title'),
        "description": t('newsroom.intro'),
        "datePublished": "2026-04-30",
        "author": {
            "@type": "Person",
            "name": "Do Gia Huy"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Arteo Social Network",
            "alternateName": "Arteo App"
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        } else if (id === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black selection:bg-zinc-200 dark:selection:bg-zinc-800 text-black dark:text-white antialiased">
            <SEO 
                title={`${t('newsroom.title')} | Arteo Social Network`} 
                description={t('newsroom.intro')}
                keywords="Arteo, Arteo App, Arteo Social, Arteo Social Network, Do Gia Huy, Modular Social"
                jsonLd={[newsroomSchema, faqSchema]}
            />

            {/* Navigation - Minimal B&W */}
            <nav className="sticky top-0 z-50 bg-white dark:bg-black border-b border-black dark:border-white">
                <div className="max-w-screen-xl mx-auto px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="cursor-pointer">
                        <Logo />
                    </Link>
                    <div className="hidden md:flex items-center gap-10 text-[14px] font-medium text-black dark:text-white cursor-pointer">
                        <span onClick={() => scrollToSection('privacy')}>Privacy</span>
                        <span onClick={() => scrollToSection('cookie')}>Cookie</span>
                        <span onClick={() => scrollToSection('contact')}>Contact</span>
                    </div>
                </div>
            </nav>

            <main className="py-24">
                {/* Header Section */}
                <header className="max-w-4xl mx-auto px-8 mb-20">
                    <div className="flex items-center gap-4 mb-8 text-[14px] text-zinc-500">
                        <span 
                            onClick={() => scrollToSection('top')}
                            className="font-bold border-b border-black dark:border-white pb-0.5 cursor-pointer"
                        >
                            {t('newsroom.category')}
                        </span>
                        <span>{t('newsroom.date')}</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[0.95] font-display text-black dark:text-white">
                        {t('newsroom.title')}
                    </h1>
                </header>

                {/* Video Banner */}
                <div className="max-w-screen-xl mx-auto px-8 mb-24">
                    <div className="relative aspect-video bg-black overflow-hidden border border-black dark:border-white">
                        <video 
                            autoPlay 
                            muted 
                            loop 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover grayscale opacity-90"
                        >
                            <source src="/Video/Arteo.mp4" type="video/mp4" />
                        </video>
                    </div>
                </div>

                {/* Article Content */}
                <article className="max-w-3xl mx-auto px-8 space-y-24">
                    {/* Key Takeaways - High Density SEO */}
                    <section className="p-10 bg-zinc-50 dark:bg-zinc-950 border border-black dark:border-white space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Key Takeaways</h2>
                        <p className="text-xl md:text-2xl font-medium leading-snug text-black dark:text-white">
                            {t('newsroom.key_takeaways_text')}
                        </p>
                    </section>

                    {/* Intro */}
                    <div className="space-y-12">
                        <p className="text-2xl md:text-4xl font-medium leading-tight font-display text-black dark:text-white">
                            {t('newsroom.intro')}
                        </p>
                        <div className="w-16 h-1 bg-black dark:bg-white" />
                    </div>

                    {/* Sections Flow */}
                    <div className="space-y-24">
                        <section className="space-y-8">
                            <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight font-display">
                                {t('newsroom.pre_arteo_era_title')}
                            </h2>
                            <div className="text-xl text-black dark:text-white leading-relaxed font-light font-readable">
                                <p>{t('newsroom.pre_arteo_era_text')}</p>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight font-display">
                                {t('newsroom.what_is_arteo_title')}
                            </h2>
                            <div className="text-xl text-black dark:text-white leading-relaxed font-light font-readable">
                                <p>{t('newsroom.what_is_arteo_text')}</p>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight font-display">
                                {t('newsroom.what_is_arteo_social_title')}
                            </h2>
                            <div className="text-xl text-black dark:text-white leading-relaxed font-light font-readable">
                                <p>{t('newsroom.what_is_arteo_social_text')}</p>
                            </div>
                        </section>

                        {/* Feature Box: Recode */}
                        <section className="p-12 border border-black dark:border-white space-y-10">
                            <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight font-display">
                                {t('newsroom.recode_title')}
                            </h2>
                            <div className="text-xl text-black dark:text-white leading-relaxed font-light font-readable space-y-8">
                                <p>{t('newsroom.recode_text')}</p>
                                <p className="p-8 bg-zinc-50 dark:bg-zinc-950 border-l border-black dark:border-white italic">
                                    {t('newsroom.recode_deep_dive')}
                                </p>
                            </div>
                        </section>

                        {/* FAQ Section - AI LOVE THIS */}
                        <section className="space-y-12">
                            <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight font-display">
                                {t('newsroom.faq_title')}
                            </h2>
                            <div className="space-y-10">
                                {Array.isArray(faqItems) && faqItems.map((item, index) => (
                                    <div key={index} className="space-y-4">
                                        <h3 className="text-xl font-bold text-black dark:text-white leading-snug">
                                            {item.question}
                                        </h3>
                                        <p className="text-lg text-black dark:text-white leading-relaxed font-light font-readable pl-6 border-l border-zinc-200 dark:border-zinc-800">
                                            {item.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Privacy & Safety - ANCHOR: privacy */}
                        <section id="privacy" className="space-y-8 pt-16 border-t border-black dark:border-white scroll-mt-24">
                            <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight font-display">
                                {t('newsroom.safety_title')}
                            </h2>
                            <div className="text-xl text-black dark:text-white leading-relaxed font-light font-readable">
                                <p>{t('newsroom.safety_text')}</p>
                            </div>
                        </section>
                    </div>

                    {/* Footer / Signature */}
                    <footer className="pt-24 space-y-16">
                        <div className="flex flex-col md:flex-row items-center gap-12 py-16 border-y border-black dark:border-white">
                            <img 
                                src="/Founder/DoGiaHuy.jpg" 
                                alt="Do Gia Huy" 
                                className="w-28 h-28 object-cover grayscale border border-black dark:border-white"
                            />
                            <div className="space-y-2 text-center md:text-left flex-1">
                                <p className="text-[11px] font-bold text-zinc-500 tracking-tight">System Architect & Visionary</p>
                                <h3 className="text-4xl font-bold text-black dark:text-white tracking-tighter font-display">Do Gia Huy</h3>
                                <p className="text-lg text-zinc-500 font-light italic leading-relaxed">
                                    "{t('newsroom.footer_note')}"
                                </p>
                            </div>
                        </div>
                        <div className="text-center space-y-4 pb-12">
                            <p className="text-[11px] text-zinc-400 font-bold tracking-widest">
                                (c) 2026 Arteo Social | Official Arteo App Documentation
                            </p>
                        </div>
                    </footer>
                </article>
            </main>
        </div>
    );
};

export default About;

