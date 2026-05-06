/**
 * Arteo Service Layer - Entry Point
 * Service exports for the Arteo frontend.
 */

export { default as client } from '@shared/api/httpClient';
export * from './identity.service';
export * from './post.service';
export * from './civic.service';
export * from './user.service';
export * from './search.service';
export * from './support.service';
export * from './admin.service';
export * from './util.service';
export * from './algorithm.service';
export * from './socket';
