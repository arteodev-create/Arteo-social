import twemoji from 'twemoji';

/**
 * Converts Unicode emoji in text into Twemoji SVG image markup.
 * @param text Text containing emoji.
 * @returns HTML string containing Twemoji img tags.
 */
export const parseToTwemoji = (text: string): string => {
    if (!text) return '';

    return twemoji.parse(text, {
        folder: 'svg',
        ext: '.svg',
        base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    });
};

