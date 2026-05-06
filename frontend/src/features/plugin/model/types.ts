export interface PluginAuthor {
  uuid?: string;
  username?: string;
  fullName?: string;
  full_name?: string;
  avatar?: string;
  isVerified?: boolean;
  is_verified?: boolean;
}

export interface Plugin {
  uuid: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  tags?: string[];
  code?: string;
  author?: PluginAuthor;
  isPublic?: boolean;
  is_public?: boolean;
  authorId?: string;
  author_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PluginPayload {
  name: string;
  description?: string;
  category?: string;
  version?: string;
  tags?: string[];
  code?: string;
  isPublic?: boolean;
  is_public?: boolean;
}

export interface PluginListResponse {
  plugins: Plugin[];
}

export interface PluginDetailResponse {
  plugin?: Plugin;
}
