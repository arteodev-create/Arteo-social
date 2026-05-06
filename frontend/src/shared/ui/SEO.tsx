import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    canonical?: string;
    image?: string;
    type?: 'website' | 'profile' | 'article';
    jsonLd?: object;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = 'Arteo Social is an identity-first social platform for creators, communities, and modular digital ownership.',
    keywords = 'Arteo, Arteo Social, social network, digital identity, creator platform, modular social protocol',
    canonical,
    image,
    type = 'website',
    jsonLd
}) => {
    const { i18n } = useTranslation();
    const siteTitle = 'Arteo';
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
    const baseUrl = (process.env.REACT_APP_SITE_URL || (window.location.hostname === 'localhost' ? 'https://arteosocial.com' : window.location.origin)).replace(/\/$/, '');
    const path = window.location.pathname;
    const finalCanonical = canonical || `${baseUrl}${path}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <html lang={i18n.language || 'en'} />

            <link rel="canonical" href={finalCanonical} />
            <link rel="alternate" hrefLang="en-US" href={finalCanonical} />
            <link rel="alternate" hrefLang="x-default" href={finalCanonical} />

            <meta property="og:type" content={type} />
            <meta property="og:url" content={finalCanonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content="Arteo" />
            {image && <meta property="og:image" content={image} />}

            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
