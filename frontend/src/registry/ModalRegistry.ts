import React from 'react';
import { MODAL_IDS } from '../constants/modalIds';
import { ModalPayloadMap, ModalComponentBaseProps } from './modalTypes';

type RegisteredModalId = Exclude<keyof ModalPayloadMap, MODAL_IDS.LIGHTBOX>;
type RegisteredModalComponent<K extends RegisteredModalId> = React.ComponentType<
  ModalComponentBaseProps & ModalPayloadMap[K]
>;

/**
 * ModalRegistry
 * Centralized map for lazy modal components.
 */
export const ModalRegistry: { [K in RegisteredModalId]: RegisteredModalComponent<K> } = {
  [MODAL_IDS.CREATE_POST]: React.lazy(() => import('../features/post/ui/CreatePostModal')) as RegisteredModalComponent<MODAL_IDS.CREATE_POST>,
  [MODAL_IDS.EDIT_PROFILE]: React.lazy(() => import('../entities/user/ui/EditProfileModal')) as RegisteredModalComponent<MODAL_IDS.EDIT_PROFILE>,
    [MODAL_IDS.CONFIRM]: React.lazy(() => import('@shared/ui/RegistryConfirmModal')) as RegisteredModalComponent<MODAL_IDS.CONFIRM>,
  [MODAL_IDS.RENEWAL_NOTICE]: React.lazy(() => import('../features/auth/ui/RenewalNoticeModal')) as RegisteredModalComponent<MODAL_IDS.RENEWAL_NOTICE>,
  [MODAL_IDS.COMMUNITY_RESPONSIBILITY]: React.lazy(() => import('../features/auth/ui/CommunityResponsibilityModal')) as RegisteredModalComponent<MODAL_IDS.COMMUNITY_RESPONSIBILITY>
};
