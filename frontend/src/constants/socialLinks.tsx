import React from 'react';
import { 
    Instagram, 
    Youtube, 
    Twitter, 
    MessageCircle 
} from 'lucide-react';
import { TiktokLogo } from '@phosphor-icons/react';

export interface SocialLink {
    id: string;
    name: string;
    url: string;
    icon: (size?: number) => React.ReactNode;
    handle: string;
    color: string;
}

export const ARTEO_SOCIAL_LINKS: SocialLink[] = [
    {
        id: 'instagram',
        name: 'Instagram',
        url: 'https://www.instagram.com/arteoapp/',
        icon: (size = 20) => <Instagram size={size} strokeWidth={1.5} />,
        handle: '@arteoapp',
        color: 'hover:text-[#E4405F]'
    },
    {
        id: 'threads',
        name: 'Threads',
        url: 'https://www.threads.com/@arteoapp0x',
        icon: (size = 20) => <MessageCircle size={size} strokeWidth={1.5} />,
        handle: '@arteoapp0x',
        color: 'hover:text-[#000000]'
    },
    {
        id: 'twitter',
        name: 'X (Twitter)',
        url: 'https://x.com/ArteoApp',
        icon: (size = 20) => <Twitter size={size} strokeWidth={1.5} />,
        handle: '@ArteoApp',
        color: 'hover:text-[#1DA1F2]'
    },
    {
        id: 'tiktok',
        name: 'TikTok',
        url: 'https://www.tiktok.com/@arteoapp',
        icon: (size = 20) => <TiktokLogo size={size} weight="light" />,
        handle: '@arteoapp',
        color: 'hover:text-[#000000]'
    },
    {
        id: 'youtube',
        name: 'YouTube',
        url: 'https://www.youtube.com/@Arteoappx0',
        icon: (size = 20) => <Youtube size={size} strokeWidth={1.5} />,
        handle: '@Arteoappx0',
        color: 'hover:text-[#FF0000]'
    }
];

