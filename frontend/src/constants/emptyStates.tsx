import { 
    Sparkles, SearchX, WifiOff, 
    UserX, Boxes, DraftingCompass, MousePointer2, Inbox
} from 'lucide-react';
import { AlgorithmIcon } from '@shared/ui/AlgorithmIcon';

export const EMPTY_STATE_CODES = {
    FEED_EMPTY: '8263447162AeywvT',
    SEARCH_EMPTY: '9172283411XpqztM',
    CONNECTION_ERROR: '7721554910BpmqtR',
    ALGO_NOT_FOUND: '3381920155LmnbvD',
    PROFILE_EMPTY: '1102938475KjhgfS',
    USER_NOT_FOUND: '4491827364ZxcvbN',
    PLUGINS_EMPTY: '5591827364WxcvbN',
    ALGORITHMS_EMPTY: '2291827364ZxcvbM',
    PIPELINE_EMPTY: '2281920374KlmntP'
} as const;

export type EmptyStateCode = typeof EMPTY_STATE_CODES[keyof typeof EMPTY_STATE_CODES];

export interface EmptyStateConfig {
    icon: any;
    title: string;
    description: string;
}

export const EMPTY_STATES: Record<EmptyStateCode, EmptyStateConfig> = {
    [EMPTY_STATE_CODES.FEED_EMPTY]: {
        icon: Sparkles,
        title: 'empty_states.feed_empty.title',
        description: 'empty_states.feed_empty.description'
    },
    [EMPTY_STATE_CODES.SEARCH_EMPTY]: {
        icon: SearchX,
        title: 'empty_states.search_empty.title',
        description: 'empty_states.search_empty.description'
    },
    [EMPTY_STATE_CODES.CONNECTION_ERROR]: {
        icon: WifiOff,
        title: 'empty_states.connection_error.title',
        description: 'empty_states.connection_error.description'
    },
    [EMPTY_STATE_CODES.ALGO_NOT_FOUND]: {
        icon: AlgorithmIcon,
        title: 'empty_states.algo_not_found.title',
        description: 'empty_states.algo_not_found.description'
    },
    [EMPTY_STATE_CODES.PROFILE_EMPTY]: {
        icon: Inbox,
        title: 'empty_states.profile_empty.title',
        description: 'empty_states.profile_empty.description'
    },
    [EMPTY_STATE_CODES.USER_NOT_FOUND]: {
        icon: UserX,
        title: 'empty_states.user_not_found.title',
        description: 'empty_states.user_not_found.description'
    },
    [EMPTY_STATE_CODES.PLUGINS_EMPTY]: {
        icon: Boxes,
        title: 'empty_states.plugins_empty.title',
        description: 'empty_states.plugins_empty.description'
    },
    [EMPTY_STATE_CODES.ALGORITHMS_EMPTY]: {
        icon: DraftingCompass,
        title: 'empty_states.algorithms_empty.title',
        description: 'empty_states.algorithms_empty.description'
    },
    [EMPTY_STATE_CODES.PIPELINE_EMPTY]: {
        icon: MousePointer2,
        title: 'empty_states.pipeline_empty.title',
        description: 'empty_states.pipeline_empty.description'
    }
};
