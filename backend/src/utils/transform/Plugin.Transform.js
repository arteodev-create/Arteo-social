const { DEFAULT_DOMAIN, buildHandle } = require('../../modules/identity/IdentityHandle');
const StringUtils = require('../String.Utils');
const MediaService = require('../../modules/media/Media.Service');

const formatAuthor = (author) => author ? {
  uuid: author.uuid,
  username: author.username,
  identityDomain: author.identityDomain || DEFAULT_DOMAIN,
  domain: author.identityDomain || DEFAULT_DOMAIN,
  handle: buildHandle(author.username, author.identityDomain || DEFAULT_DOMAIN),
  fullName: author.fullName,
  full_name: author.fullName,
  avatar: MediaService.normalizeFileUrl(author.avatar),
  isVerified: author.isVerified,
  is_verified: author.isVerified
} : undefined;

const formatSourcePlugin = (p) => {
  if (!p) return null;
  return {
    uuid: p.uuid,
    slug: StringUtils.slugify(p.name),
    author_id: p.authorId,
    authorId: p.authorId,
    name: p.name,
    description: p.description,
    category: p.category,
    is_public: p.isPublic,
    isPublic: p.isPublic,
    version: p.version,
    blocks_metadata: p.blocksMetadata,
    blocksMetadata: p.blocksMetadata,
    installed_from_id: p.installedFromId,
    installedFromId: p.installedFromId,
    tags: p.tags,
    author: formatAuthor(p.author),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    created_at: p.createdAt,
    updated_at: p.updatedAt
  };
};

/**
 * Plugin Transform Utility
 * Projecting Plugin entities for API consumers.
 */
module.exports = {
  formatPlugin: (p) => {
    if (!p) return null;
    const sourcePlugin = formatSourcePlugin(p.sourcePlugin || p.source_plugin);
    return {
      uuid: p.uuid,
      slug: StringUtils.slugify(p.name),
      author_id: p.authorId,
      name: p.name,
      description: p.description,
      code: p.code,
      category: p.category,
      is_public: p.isPublic,
      version: p.version,
      blocks_metadata: p.blocksMetadata,
      installed_from_id: p.installedFromId,
      source_plugin: sourcePlugin,
      tags: p.tags,
      author: formatAuthor(p.author),
      authorId: p.authorId,
      installedFromId: p.installedFromId,
      sourcePlugin,
      isPublic: p.isPublic,
      blocksMetadata: p.blocksMetadata,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    };
  },
  formatCategory: (c) => {
    if (!c) return null;
    return {
      uuid: c.uuid,
      name: c.name,
      slug: c.slug,
      description: c.description,
      is_system: c.isSystem,
      usage_count: c.usageCount,
      created_at: c.createdAt,
      updated_at: c.updatedAt
    };
  }
};
