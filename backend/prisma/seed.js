const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const uuid = (group, index) => `${group}-0000-0000-0000-${String(index).padStart(12, '0')}`;

const topics = [
  'Technology', 'AI', 'Design', 'Startups', 'Gaming', 'Music', 'Film', 'Books',
  'Education', 'Science', 'Space', 'Health', 'Fitness', 'Food', 'Travel', 'Nature',
  'Photography', 'Finance', 'Crypto', 'Productivity', 'Culture', 'Sports', 'Fashion',
  'Architecture', 'Environment'
];

const firstNames = [
  'An', 'Bao', 'Chi', 'Duy', 'Giang', 'Hao', 'Khanh', 'Linh', 'Mai', 'Minh',
  'Nam', 'Nhi', 'Phong', 'Quyen', 'Son', 'Thao', 'Trang', 'Tuan', 'Vy', 'Yen',
  'Alex', 'Maya', 'Noah', 'Iris', 'Leo', 'Nora', 'Kai', 'Mina', 'Theo', 'Zara'
];

const lastNames = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Dang', 'Bui', 'Do', 'Phan',
  'Studio', 'Labs', 'Works', 'Creative', 'Daily', 'Signal', 'Node', 'Pixel'
];

const roles = [
  'frontend engineer', 'product designer', 'indie founder', 'AI researcher',
  'game developer', 'music curator', 'film critic', 'teacher', 'photographer',
  'fitness coach', 'food writer', 'travel planner', 'climate analyst',
  'finance builder', 'student maker', 'community moderator'
];

const postTemplates = [
  'Testing a sharper workflow for {topic}. Small improvements compound fast.',
  'Today I learned something useful about {topic}. The best systems feel calm, not noisy.',
  'A quick note on {topic}: clear defaults beat complicated controls almost every time.',
  'Building in public around {topic}. Feedback is welcome.',
  'The next wave of {topic} will be shaped by people who care about details.',
  'Saved a few references for {topic}. This space is moving quickly.',
  'A practical checklist for {topic}: make it fast, legible, and easy to trust.',
  'Experimenting with {topic} on Arteo. The feed already feels more alive.'
];

const algorithmSeeds = [
  {
    name: 'Arteo Standard',
    category: 'Standard',
    description: 'Balanced social feed for launch: recent posts, trusted authors, and healthy topic variety.',
    tags: ['standard', 'launch', 'balanced'],
    pipeline: [{ command: 'rank', by: 'recency' }, { command: 'blend', topics: 8 }, { command: 'dedupe', perAuthor: 2 }]
  },
  {
    name: 'Fresh First',
    category: 'Realtime',
    description: 'Prioritizes new public posts while preserving a small engagement signal.',
    tags: ['fresh', 'realtime'],
    pipeline: [{ command: 'rank', by: 'createdAt' }, { command: 'boost', signal: 'new' }]
  },
  {
    name: 'Creator Mix',
    category: 'Creative',
    description: 'Gives more room to design, music, film, photography, and maker posts.',
    tags: ['creative', 'media', 'maker'],
    pipeline: [{ command: 'filter', topics: ['Design', 'Music', 'Film', 'Photography'] }, { command: 'rank', by: 'quality' }]
  },
  {
    name: 'Tech Radar',
    category: 'Technology',
    description: 'Surfaces AI, engineering, product, startup, and science conversations.',
    tags: ['ai', 'tech', 'startup'],
    pipeline: [{ command: 'filter', topics: ['Technology', 'AI', 'Startups', 'Science'] }, { command: 'boost', verified: true }]
  },
  {
    name: 'Local Warmth',
    category: 'Community',
    description: 'A calmer discovery feed for everyday community posts and replies.',
    tags: ['community', 'calm'],
    pipeline: [{ command: 'blend', topics: 12 }, { command: 'downrank', signal: 'ragebait' }]
  },
  {
    name: 'Market Watch',
    category: 'Finance',
    description: 'Finance, crypto, business, and productivity with stronger freshness weighting.',
    tags: ['finance', 'crypto', 'business'],
    pipeline: [{ command: 'filter', topics: ['Finance', 'Crypto', 'Productivity'] }, { command: 'rank', by: 'trend' }]
  },
  {
    name: 'Learning Loop',
    category: 'Education',
    description: 'Education, books, science, and practical notes for people who want useful feeds.',
    tags: ['education', 'books', 'science'],
    pipeline: [{ command: 'filter', topics: ['Education', 'Books', 'Science'] }, { command: 'rank', by: 'saveRate' }]
  },
  {
    name: 'Weekend Mode',
    category: 'Lifestyle',
    description: 'Travel, food, sport, fitness, nature, and culture for a lighter feed.',
    tags: ['lifestyle', 'travel', 'food'],
    pipeline: [{ command: 'filter', topics: ['Travel', 'Food', 'Sports', 'Nature', 'Culture'] }, { command: 'shuffle', strength: 0.2 }]
  },
  {
    name: 'Verified Voices',
    category: 'Trust',
    description: 'Boosts verified accounts while still leaving room for new creators.',
    tags: ['verified', 'trust'],
    pipeline: [{ command: 'boost', verified: true }, { command: 'dedupe', perAuthor: 1 }]
  },
  {
    name: 'Quiet Focus',
    category: 'Focus',
    description: 'Lower-noise feed that favors thoughtful posts and avoids overloaded trends.',
    tags: ['focus', 'quality'],
    pipeline: [{ command: 'rank', by: 'quality' }, { command: 'downrank', signal: 'overexposed' }]
  }
];

const pluginSeeds = [
  ['Arteo Link Preview', 'UI', 'Creates clean link preview blocks for social posts.', ['ui', 'link', 'preview']],
  ['Thread Composer Kit', 'Tool', 'Helpers for drafting, splitting, and reviewing thread posts.', ['post', 'thread']],
  ['Smart Moderation Lite', 'Safety', 'Basic safety labels and moderation summaries for launch communities.', ['safety', 'moderation']],
  ['Creator Analytics Panel', 'Analytics', 'Simple creator metrics for views, saves, likes, and reposts.', ['analytics', 'creator']],
  ['Media Optimizer', 'Media', 'Compresses and normalizes image metadata before publishing.', ['media', 'performance']],
  ['Poll Insight Blocks', 'Tool', 'Reusable poll result cards and lightweight vote summaries.', ['poll', 'insight']],
  ['Profile Theme Pack', 'UI', 'Launch-safe profile appearance presets.', ['profile', 'theme']],
  ['Feed Quality Guard', 'Algorithm', 'Blocks that help ranking pipelines reduce duplicates and stale posts.', ['feed', 'algorithm']],
  ['Download Exporter', 'Utility', 'Exports plugin code as portable ReCode files.', ['download', 'export']],
  ['Library Installer', 'Utility', 'Installs public Arteo Library items into a user workspace.', ['library', 'install']]
];

async function upsertTopics() {
  await prisma.topic.createMany({
    data: topics.map((topic, index) => ({
      uuid: uuid('30000000', index + 1),
      name: topic,
      slug: topic.toLowerCase().replace(/\s+/g, '-')
    })),
    skipDuplicates: true
  });
}

async function upsertUsers(passwordHash) {
  const data = [];
  const usernames = [];
  for (let i = 0; i < 100; i += 1) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 7) % lastNames.length];
    const topic = topics[i % topics.length];
    const role = roles[i % roles.length];
    const username = `${first}${last}${String(i + 1).padStart(2, '0')}`.toLowerCase();
    usernames.push(username);
    const isAdmin = i === 0;
    data.push({
      uuid: uuid('20000000', i + 1),
      username,
      email: `${username}@arteo.seed`,
      password: passwordHash,
      fullName: `${first} ${last}`,
      bio: `${role} sharing notes about ${topic}, tools, and daily building on Arteo.`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
      location: ['Ho Chi Minh City', 'Ha Noi', 'Da Nang', 'Singapore', 'Tokyo', 'San Francisco'][i % 6],
      professionalCategory: role,
      headline: `${topic} explorer`,
      isVerified: i < 18,
      isAdmin,
      role: isAdmin ? 'admin' : 'user',
      emailVerified: true,
      language: i % 3 === 0 ? 'vn' : 'en'
    });
  }

  await prisma.user.createMany({ data, skipDuplicates: true });
  return prisma.user.findMany({
    where: { username: { in: usernames } },
    orderBy: { uuid: 'asc' }
  });
}

async function upsertFollows(users) {
  const data = [];
  for (let i = 0; i < users.length; i += 1) {
    for (let step = 1; step <= 5; step += 1) {
      const following = users[(i + step * 3) % users.length];
      if (users[i].uuid === following.uuid) continue;
      data.push({
        uuid: uuid('21000000', i * 5 + step),
        followerId: users[i].uuid,
        followingId: following.uuid
      });
    }
  }
  await prisma.follow.createMany({ data, skipDuplicates: true });
}

async function upsertAlgorithms(users) {
  const author = users[0];
  await prisma.userAlgorithm.createMany({
    data: algorithmSeeds.map((algorithm, i) => ({
      uuid: uuid('00000000', i + 1),
      userId: author.uuid,
      name: algorithm.name,
      shortDescription: algorithm.description.slice(0, 240),
      description: algorithm.description,
      weights: { code: algorithm.pipeline.map(item => `${item.command}:${JSON.stringify(item)}`).join('\n') },
      pipeline: algorithm.pipeline,
      isActive: i === 0,
      isPublic: true,
      isPinned: i < 4,
      pinOrder: i < 4 ? i + 1 : 0,
      version: '1.0.0',
      tags: algorithm.tags,
      usageCount: 500 - i * 27
    })),
    skipDuplicates: true
  });
}

async function upsertPlugins(users) {
  await prisma.plugin.createMany({
    data: pluginSeeds.map((pluginSeed, i) => {
      const [name, category, description, tags] = pluginSeed;
      return {
        uuid: uuid('11111111', i + 1),
        authorId: users[i % users.length].uuid,
        name,
        description,
        category,
        tags,
        isPublic: true,
        version: `1.${i + 1}.0`,
        blocksMetadata: [{ id: 'main', name: 'Main', type: 'utility' }],
        code: `plugin "${name}" {\n  category "${category}"\n  version "1.${i + 1}.0"\n  tags ${JSON.stringify(tags)}\n\n  block "Main" {\n    return "${name} ready"\n  }\n}`
      };
    }),
    skipDuplicates: true
  });
}

async function upsertPosts(users) {
  const topicRows = await prisma.topic.findMany();
  const topicByName = new Map(topicRows.map(topic => [topic.name, topic]));
  const posts = [];
  const stats = [];

  for (let i = 0; i < 300; i += 1) {
    const user = users[i % users.length];
    const topic = topics[(i * 7) % topics.length];
    const topicRow = topicByName.get(topic);
    const content = `${postTemplates[i % postTemplates.length].replace('{topic}', topic)} #${topic.replace(/\s+/g, '')} #Arteo`;
    const postId = uuid('40000000', i + 1);

    posts.push({
      uuid: postId,
      userId: user.uuid,
      content,
      topic,
      topicId: topicRow?.uuid,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      createdAt: new Date(Date.now() - i * 27 * 60 * 1000)
    });

    stats.push({
      postId,
      likeCount: (i * 13) % 900,
      repostCount: (i * 5) % 180,
      quoteCount: (i * 3) % 80,
      replyCount: (i * 7) % 120,
      bookmarkCount: (i * 11) % 240,
      viewCount: 500 + ((i * 97) % 20000)
    });
  }

  await prisma.post.createMany({ data: posts, skipDuplicates: true });
  await prisma.postStat.createMany({ data: stats, skipDuplicates: true });
}

/*
async function upsertAlgorithmsLegacy(users) {
  const author = users[0];
  for (let i = 0; i < algorithmSeeds.length; i += 1) {
    const algorithm = algorithmSeeds[i];
    await prisma.userAlgorithm.upsert({
      where: { uuid: uuid('00000000', i + 1) },
      update: {
        name: algorithm.name,
        shortDescription: algorithm.description.slice(0, 240),
        description: algorithm.description,
        weights: { code: algorithm.pipeline.map(item => `${item.command}:${JSON.stringify(item)}`).join('\n') },
        pipeline: algorithm.pipeline,
        tags: algorithm.tags,
        isPublic: true,
        isPinned: i < 4,
        pinOrder: i < 4 ? i + 1 : 0,
        userId: author.uuid
      },
      create: {
        uuid: uuid('00000000', i + 1),
        userId: author.uuid,
        name: algorithm.name,
        shortDescription: algorithm.description.slice(0, 240),
        description: algorithm.description,
        weights: { code: algorithm.pipeline.map(item => `${item.command}:${JSON.stringify(item)}`).join('\n') },
        pipeline: algorithm.pipeline,
        isActive: i === 0,
        isPublic: true,
        isPinned: i < 4,
        pinOrder: i < 4 ? i + 1 : 0,
        version: '1.0.0',
        tags: algorithm.tags,
        usageCount: 500 - i * 27
      }
    });
  }
}

async function upsertPluginsLegacy(users) {
  for (let i = 0; i < pluginSeeds.length; i += 1) {
    const [name, category, description, tags] = pluginSeeds[i];
    await prisma.plugin.upsert({
      where: { uuid: uuid('11111111', i + 1) },
      update: {
        name,
        description,
        category,
        tags,
        isPublic: true,
        version: `1.${i + 1}.0`,
        code: `plugin "${name}" {\n  category "${category}"\n  version "1.${i + 1}.0"\n  tags ${JSON.stringify(tags)}\n\n  block "Main" {\n    return "${name} ready"\n  }\n}`
      },
      create: {
        uuid: uuid('11111111', i + 1),
        authorId: users[i % users.length].uuid,
        name,
        description,
        category,
        tags,
        isPublic: true,
        version: `1.${i + 1}.0`,
        blocksMetadata: [{ id: 'main', name: 'Main', type: 'utility' }],
        code: `plugin "${name}" {\n  category "${category}"\n  version "1.${i + 1}.0"\n  tags ${JSON.stringify(tags)}\n\n  block "Main" {\n    return "${name} ready"\n  }\n}`
      }
    });
  }
}

async function upsertPostsLegacy(users) {
  const topicRows = await prisma.topic.findMany();
  const topicByName = new Map(topicRows.map(topic => [topic.name, topic]));

  for (let i = 0; i < 300; i += 1) {
    const user = users[i % users.length];
    const topic = topics[(i * 7) % topics.length];
    const topicRow = topicByName.get(topic);
    const content = `${postTemplates[i % postTemplates.length].replace('{topic}', topic)} #${topic.replace(/\s+/g, '')} #Arteo`;
    const postId = uuid('40000000', i + 1);

    await prisma.post.upsert({
      where: { uuid: postId },
      update: {
        userId: user.uuid,
        content,
        topic,
        topicId: topicRow?.uuid,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        deletedAt: null
      },
      create: {
        uuid: postId,
        userId: user.uuid,
        content,
        topic,
        topicId: topicRow?.uuid,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(Date.now() - i * 27 * 60 * 1000),
        stats: {
          create: {
            likeCount: (i * 13) % 900,
            repostCount: (i * 5) % 180,
            quoteCount: (i * 3) % 80,
            replyCount: (i * 7) % 120,
            bookmarkCount: (i * 11) % 240,
            viewCount: 500 + ((i * 97) % 20000)
          }
        }
      }
    });
  }
}
*/

async function main() {
  console.log('--- Seeding Arteo launch dataset ---');
  const passwordHash = await bcrypt.hash('Arteo@2026', 10);

  await upsertTopics();
  const users = await upsertUsers(passwordHash);
  await upsertFollows(users);
  await upsertAlgorithms(users);
  await upsertPlugins(users);
  await upsertPosts(users);

  console.log(`Seeded ${users.length} users, ${topics.length} topics, ${algorithmSeeds.length} algorithms, ${pluginSeeds.length} library plugins, and 300 posts.`);
  console.log('Default seeded password for all users: Arteo@2026');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
