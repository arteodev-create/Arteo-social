require('dotenv').config();

const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const hashCode = (code) => crypto.createHash('sha1').update(code || '').digest('hex');

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
};

const clonePluginForUser = async (source, userId) => {
  const existing = await prisma.plugin.findFirst({
    where: {
      authorId: userId,
      deletedAt: null,
      OR: [
        { installedFromId: source.uuid },
        { code: source.code },
      ],
    },
  });
  if (existing) return { plugin: existing, created: false };

  const plugin = await prisma.plugin.create({
    data: {
      authorId: userId,
      name: source.name,
      description: source.description,
      code: source.code,
      category: source.category || 'General',
      categoryId: source.categoryId,
      isPublic: false,
      version: source.version || '1.0.0',
      blocksMetadata: source.blocksMetadata || [],
      installedFromId: source.uuid,
      tags: source.tags || [],
    },
  });

  return { plugin, created: true };
};

const extractPluginIds = (value) => {
  const ids = new Set();
  const visit = (item) => {
    if (!item) return;
    if (typeof item === 'string') {
      (item.match(UUID_PATTERN) || []).forEach((id) => ids.add(id));
      return;
    }
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (typeof item !== 'object') return;
    Object.values(item).forEach(visit);
  };

  visit(value);
  return Array.from(ids);
};

const rewritePluginIds = (value, idMap) => {
  if (!value || idMap.size === 0) return value;
  if (typeof value === 'string') {
    return Array.from(idMap.entries()).reduce(
      (text, [from, to]) => text.replaceAll(from, to),
      value
    );
  }
  if (Array.isArray(value)) return value.map((item) => rewritePluginIds(item, idMap));
  if (typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, rewritePluginIds(child, idMap)])
  );
};

const normalizeDependencyList = (dependencies, sourceById, localBySourceId, fallbackIds = []) => {
  const bySourceId = new Map();

  const add = (sourceId) => {
    const source = sourceById.get(sourceId);
    const local = localBySourceId.get(sourceId);
    if (!source || !local || bySourceId.has(sourceId)) return;
    bySourceId.set(sourceId, {
      sourcePluginId: source.uuid,
      localPluginId: local.uuid,
      pluginId: local.uuid,
      name: source.name,
      version: source.version || '1.0.0',
      blockCount: Array.isArray(source.blocksMetadata) ? source.blocksMetadata.length : 0,
      alreadyDownloaded: source.uuid !== local.uuid,
      wasDownloaded: false,
    });
  };

  if (Array.isArray(dependencies)) {
    dependencies.forEach((dependency) => {
      const candidateId = dependency?.sourcePluginId || dependency?.pluginId || dependency?.localPluginId || dependency?.pluginUuid || dependency?.uuid;
      const source = sourceById.get(candidateId);
      if (source) add(source.uuid);
    });
  }

  fallbackIds.forEach((id) => {
    const source = sourceById.get(id);
    if (source) add(source.uuid);
  });

  return Array.from(bySourceId.values());
};

const main = async () => {
  const report = {
    pluginSourcesBackfilled: 0,
    pluginCopiesCreated: 0,
    algorithmsUpdated: 0,
  };

  const plugins = await prisma.plugin.findMany({ where: { deletedAt: null } });
  const publicSources = plugins.filter((plugin) => plugin.isPublic && !plugin.installedFromId);
  const publicByCodeHash = new Map(publicSources.map((plugin) => [hashCode(plugin.code), plugin]));

  for (const plugin of plugins) {
    if (plugin.isPublic || plugin.installedFromId) continue;
    const source = publicByCodeHash.get(hashCode(plugin.code));
    if (!source || source.uuid === plugin.uuid) continue;
    await prisma.plugin.update({
      where: { uuid: plugin.uuid },
      data: { installedFromId: source.uuid },
    });
    plugin.installedFromId = source.uuid;
    report.pluginSourcesBackfilled += 1;
  }

  const refreshedPlugins = await prisma.plugin.findMany({ where: { deletedAt: null } });
  const sourceById = new Map();
  refreshedPlugins.forEach((plugin) => {
    if (plugin.isPublic && !plugin.installedFromId) sourceById.set(plugin.uuid, plugin);
  });
  refreshedPlugins.forEach((plugin) => {
    if (plugin.installedFromId && sourceById.has(plugin.installedFromId)) {
      sourceById.set(plugin.uuid, sourceById.get(plugin.installedFromId));
    }
  });

  const algorithms = await prisma.userAlgorithm.findMany({ where: { deletedAt: null } });

  for (const algorithm of algorithms) {
    const weights = algorithm.weights || {};
    const pipeline = algorithm.pipeline || [];
    const referencedIds = new Set([
      ...extractPluginIds(weights),
      ...extractPluginIds(pipeline),
    ]);

    const sourceIds = new Set();
    referencedIds.forEach((id) => {
      const source = sourceById.get(id);
      if (source) sourceIds.add(source.uuid);
    });

    const localBySourceId = new Map();
    const idMap = new Map();

    for (const sourceId of sourceIds) {
      const source = sourceById.get(sourceId);
      if (!source) continue;
      const userOwnsSource = source.authorId === algorithm.userId;
      const localResult = userOwnsSource
        ? { plugin: source, created: false }
        : await clonePluginForUser(source, algorithm.userId);
      if (localResult.created) report.pluginCopiesCreated += 1;

      localBySourceId.set(source.uuid, localResult.plugin);
      idMap.set(source.uuid, localResult.plugin.uuid);
      refreshedPlugins
        .filter((plugin) => plugin.installedFromId === source.uuid && plugin.authorId === algorithm.userId)
        .forEach((plugin) => idMap.set(plugin.uuid, localResult.plugin.uuid));
    }

    const normalizedDependencies = normalizeDependencyList(
      weights.pluginDependencies,
      sourceById,
      localBySourceId,
      Array.from(sourceIds)
    );

    const normalizedPluginPacks = normalizeDependencyList(
      weights.pluginPacks,
      sourceById,
      localBySourceId,
      Array.from(sourceIds)
    ).map((dependency) => ({
      ...dependency,
      priority: 'normal',
      blocksUsed: dependency.blockCount,
    }));

    const nextWeights = {
      ...rewritePluginIds(weights, idMap),
      ...(normalizedDependencies.length > 0 ? { pluginDependencies: normalizedDependencies } : {}),
      ...(normalizedPluginPacks.length > 0 ? { pluginPacks: normalizedPluginPacks } : {}),
    };
    const nextPipeline = rewritePluginIds(pipeline, idMap);

    const changed = stableStringify(weights) !== stableStringify(nextWeights) ||
      stableStringify(pipeline) !== stableStringify(nextPipeline);
    if (!changed) continue;

    await prisma.userAlgorithm.update({
      where: { uuid: algorithm.uuid },
      data: {
        weights: nextWeights,
        pipeline: nextPipeline,
      },
    });
    report.algorithmsUpdated += 1;
  }

  console.log(JSON.stringify(report, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
