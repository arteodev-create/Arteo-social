import type { User } from '@entities/user/model';

export interface PollOption {
  uuid: string;
  pollUuid: string;
  optionText: string;
  optionOrder?: number;
  voteCount?: number;
}

export interface Poll {
  uuid: string;
  postUuid: string;
  question: string;
  durationHours: number;
  expiresAt: string;
  createdAt: string;
  options: PollOption[];
  totalVotes?: number;
  userVoteOptionId?: string;
}

export interface CreatePollData {
  question: string;
  options: string[];
  durationHours: number;
}

export interface VotePollData {
  optionId: string;
}

export interface Post {
  uuid: string;
  shortId?: string;
  userId: string;
  type: 'post' | 'quote' | 'comment' | 'thread';
  content: string;
  threadIndex?: number;
  threadTotal?: number;
  gifUrl?: string;
  visibility: 'public' | 'followers' | 'mentioned';
  isEphemeral: boolean;
  expiresAt?: string;
  originalPostId?: string;
  parentId?: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  location?: string;
  stats?: {
    likeCount: number;
    repostCount: number;
    quoteCount: number;
    replyCount: number;
    bookmarkCount: number;
    reactionCount: number;
    viewCount: number;
  };
  media?: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
  }>;
  user?: User;
  author?: User;
  originalPost?: Post;
  threadChild?: Post;
  parent?: Post;
  isLiked?: boolean;
  isBookmarked?: boolean;
  myReaction?: string | null;
  isReposted?: boolean;
  isRepostedDisplay?: boolean;
  repostUser?: { username: string; fullName?: string };
  poll?: Poll;
  linkPreview?: {
    title: string;
    description: string;
    image: string;
    siteName?: string;
    url: string;
  };
  pluginScore?: number;
  reactions?: Array<{ emoji: string; userId: string }>;
}

export interface Pagination {
  page: number | string;
  pages: number | string;
  total: number | string;
  limit?: number | string;
}

export interface PostsPage {
  posts: Post[];
  pagination?: Pagination;
}

export interface PostFeedParams {
  page?: number;
  limit?: number;
  scope?: string;
  q?: string;
  type?: string;
  sort?: string;
  cursor?: string;
  location?: string;
  algorithmId?: string;
  topic?: string;
}

export interface CreatePostData {
  content: string;
  visibility?: 'public' | 'followers' | 'mentioned';
  replySettings?: 'everyone' | 'following' | 'mentioned';
  media?: File[];
  gifUrl?: string;
  scheduledAt?: string;
  poll?: CreatePollData;
  linkPreview?: Post['linkPreview'];
  originalPostId?: string;
  isEphemeral?: boolean;
  type?: 'post' | 'quote' | 'reply' | 'thread' | 'comment';
  parentId?: string;
  topic?: string;
  location?: string;
  threadIndex?: number;
  threadTotal?: number;
}
