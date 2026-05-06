/**
 * Plugin Transform Utility
 * Projecting Plugin entities for API consumers.
 */
module.exports = {
  formatPlugin: (p) => {
    if (!p) return null;
    return {
      uuid: p.uuid,
      author_id: p.authorId,
      name: p.name,
      description: p.description,
      code: p.code,
      category: p.category,
      is_public: p.isPublic,
      version: p.version,
      blocks_metadata: p.blocksMetadata,
      tags: p.tags,
      author: p.author ? {
        uuid: p.author.uuid,
        username: p.author.username,
        fullName: p.author.fullName,
        full_name: p.author.fullName,
        avatar: p.author.avatar,
        isVerified: p.author.isVerified,
        is_verified: p.author.isVerified
      } : undefined,
      authorId: p.authorId,
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
