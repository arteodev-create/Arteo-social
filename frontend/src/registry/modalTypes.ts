import { MODAL_IDS } from '../constants/modalIds';
import { Post } from '@entities/post/model';
import { User } from '@entities/user/model';
import type { MouseEvent } from 'react';

export type ConfirmAction = {
  label: string;
  onClick: (e?: MouseEvent) => void;
  variant?: 'danger' | 'primary' | 'cancel';
};

export type ConfirmModalPayload = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'danger' | 'primary' | 'success';
  actions?: ConfirmAction[];
};

export type CreatePostModalPayload = {
  onPostCreated?: (post: Post) => void;
  quotedPost?: Post | null;
  initialImage?: File | null;
  initialContent?: string;
  initialLinkPreview?: unknown;
  parentId?: string | number;
  parentPost?: Post | null;
  onSuccess?: (post: Post) => void;
};

export type EditProfileModalPayload = {
  user: User;
  onUpdate: (updatedUser: User) => void;
};

export type RenewalNoticeModalPayload = {
  onClose?: () => void;
};

export type CommunityResponsibilityModalPayload = Record<string, never>;

export type ModalPayloadMap = {
  [MODAL_IDS.CREATE_POST]: CreatePostModalPayload;
  [MODAL_IDS.EDIT_PROFILE]: EditProfileModalPayload;
  [MODAL_IDS.CONFIRM]: ConfirmModalPayload;
  [MODAL_IDS.RENEWAL_NOTICE]: RenewalNoticeModalPayload;
  [MODAL_IDS.COMMUNITY_RESPONSIBILITY]: CommunityResponsibilityModalPayload;
  [MODAL_IDS.LIGHTBOX]: { mediaUrls: string[]; initialIndex?: number };
};

export type ModalComponentBaseProps = {
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
};
