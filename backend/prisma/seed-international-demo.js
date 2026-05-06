const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const demoUsers = [
  { uuid: '20000000-0000-0000-0000-000000000001', username: 'oliviachen', email: 'olivia.chen@arteo.seed', fullName: 'Olivia Chen', location: 'San Francisco', headline: 'Product designer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000002', username: 'ethanbrooks', email: 'ethan.brooks@arteo.seed', fullName: 'Ethan Brooks', location: 'London', headline: 'AI product engineer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000003', username: 'sofiagarcia', email: 'sofia.garcia@arteo.seed', fullName: 'Sofia Garcia', location: 'Barcelona', headline: 'Culture writer', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000004', username: 'noahwilliams', email: 'noah.williams@arteo.seed', fullName: 'Noah Williams', location: 'Toronto', headline: 'Startup operator', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000005', username: 'amayapatel', email: 'amaya.patel@arteo.seed', fullName: 'Amaya Patel', location: 'Singapore', headline: 'Learning designer', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000006', username: 'liamanderson', email: 'liam.anderson@arteo.seed', fullName: 'Liam Anderson', location: 'New York', headline: 'Market analyst', avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000007', username: 'miatanaka', email: 'mia.tanaka@arteo.seed', fullName: 'Mia Tanaka', location: 'Tokyo', headline: 'Game community lead', avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000008', username: 'lucasmeyer', email: 'lucas.meyer@arteo.seed', fullName: 'Lucas Meyer', location: 'Berlin', headline: 'Photographer', avatar: 'https://randomuser.me/api/portraits/men/52.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000009', username: 'emmamorgan', email: 'emma.morgan@arteo.seed', fullName: 'Emma Morgan', location: 'Melbourne', headline: 'Climate editor', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { uuid: '20000000-0000-0000-0000-000000000010', username: 'danielkim', email: 'daniel.kim@arteo.seed', fullName: 'Daniel Kim', location: 'Seoul', headline: 'Productivity researcher', avatar: 'https://randomuser.me/api/portraits/men/64.jpg' }
];

const posts = [
  {
    uuid: '42000000-0000-0000-0000-000000000001',
    userUuid: demoUsers[0].uuid,
    topic: 'Design',
    content: 'A good profile page should feel instantly readable: name, handle, trust signal, bio, and the first few posts. Everything else can wait.',
    media: ['https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=80']
  },
  {
    uuid: '42000000-0000-0000-0000-000000000002',
    userUuid: demoUsers[1].uuid,
    topic: 'AI',
    content: [
      'I do not want an AI feed that only chases engagement.',
      '',
      'The better version is calmer: fresh posts, credible authors, topic variety, and aggressive duplicate control. Ranking should help people discover better conversations, not trap them inside the loudest one.'
    ].join('\n'),
    poll: {
      question: 'What should a social feed optimize for first?',
      options: [
        ['Freshness', 38],
        ['Trust', 51],
        ['Virality', 19],
        ['Topic diversity', 44]
      ]
    }
  },
  {
    uuid: '42000000-0000-0000-0000-000000000003',
    userUuid: demoUsers[2].uuid,
    topic: 'Culture',
    content: [
      'The best cultural feeds are not only about trends.',
      '',
      'They carry small recommendations, local context, weekend plans, old films people suddenly rediscover, and personal taste that does not need to become viral to be valuable.'
    ].join('\n'),
    media: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80'
    ]
  },
  {
    uuid: '42000000-0000-0000-0000-000000000004',
    userUuid: demoUsers[3].uuid,
    topic: 'Startups',
    content: [
      'Launch rule I keep repeating:',
      '',
      'Show fewer features, but make every visible action honest. A disabled “coming soon” button is better than a working-looking button that fails after the click.'
    ].join('\n')
  },
  {
    uuid: '42000000-0000-0000-0000-000000000005',
    userUuid: demoUsers[4].uuid,
    topic: 'Education',
    content: 'Learning products win when the interface respects attention. Clear loading states can make a small app feel much more reliable.',
    poll: {
      question: 'Which learning format do you prefer?',
      options: [
        ['Short notes', 27],
        ['Deep guides', 34],
        ['Video walkthroughs', 21],
        ['Interactive practice', 42]
      ]
    }
  },
  {
    uuid: '42000000-0000-0000-0000-000000000006',
    userUuid: demoUsers[5].uuid,
    topic: 'Finance',
    content: [
      'Market posts need context more than heat.',
      '',
      'A useful post says what changed, why it matters, what could be wrong, and when the view should be revisited. That structure makes even a short note feel accountable.'
    ].join('\n'),
    media: ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=80']
  },
  {
    uuid: '42000000-0000-0000-0000-000000000007',
    userUuid: demoUsers[6].uuid,
    topic: 'Gaming',
    content: [
      'Patch notes are underrated social content.',
      '',
      'They tell you what the team values, what the community broke, and what direction the game is quietly moving in.'
    ].join('\n'),
    media: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1400&q=80'
    ]
  },
  {
    uuid: '42000000-0000-0000-0000-000000000008',
    userUuid: demoUsers[7].uuid,
    topic: 'Photography',
    content: 'A photo post should not feel buried under UI. Give the image room, keep the caption close, and make tap-to-view feel immediate.',
    media: ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80']
  },
  {
    uuid: '42000000-0000-0000-0000-000000000009',
    userUuid: demoUsers[8].uuid,
    topic: 'Environment',
    content: [
      'Climate content becomes more useful when it is specific.',
      '',
      'Instead of “the planet is in trouble,” tell me what changed this week, where it happened, who is affected, and what action is realistic. Specificity is what turns concern into memory.'
    ].join('\n'),
    media: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1400&q=80'
    ]
  },
  {
    uuid: '42000000-0000-0000-0000-000000000010',
    userUuid: demoUsers[9].uuid,
    topic: 'Productivity',
    content: [
      'Arteo Library should start simple:',
      '',
      'Install. Download. Settings. Delete.',
      '',
      'That is enough for the first version. Extra features can arrive later when the full backend flow is real.'
    ].join('\n')
  }
];

const ids = (prefix, count) => Array.from(
  { length: count },
  (_, index) => `${prefix}-0000-0000-0000-${String(index + 1).padStart(12, '0')}`
);

async function clearPreviousSeedPosts() {
  const removablePostIds = [
    ...ids('40000000', 300),
    ...ids('41000000', 10),
    ...ids('42000000', posts.length)
  ];

  const result = await prisma.post.deleteMany({
    where: { uuid: { in: removablePostIds } }
  });
  return result.count;
}

async function updateUsers() {
  for (const [index, user] of demoUsers.entries()) {
    await prisma.user.update({
      where: { uuid: user.uuid },
      data: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: `${user.headline} based in ${user.location}. Sharing practical notes on Arteo.`,
        avatar: user.avatar,
        location: user.location,
        headline: user.headline,
        professionalCategory: user.headline,
        language: 'en',
        isVerified: false,
        emailVerified: true
      }
    });
  }
}

async function ensureTopic(name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return prisma.topic.upsert({
    where: { slug },
    update: { name },
    create: { name, slug }
  });
}

async function createPost(item, index) {
  const topic = await ensureTopic(item.topic);
  await prisma.post.create({
    data: {
      uuid: item.uuid,
      userId: item.userUuid,
      content: item.content,
      topic: item.topic,
      topicId: topic.uuid,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      createdAt: new Date(Date.now() - index * 22 * 60 * 1000),
      stats: {
        create: {
          likeCount: 32 + index * 9,
          repostCount: 5 + index * 2,
          quoteCount: index % 4,
          replyCount: 4 + index,
          bookmarkCount: 12 + index * 3,
          viewCount: 900 + index * 340
        }
      },
      media: item.media?.length ? {
        create: item.media.map((url, mediaIndex) => ({
          type: 'IMAGE',
          url,
          mimeType: 'image/jpeg',
          displayOrder: mediaIndex
        }))
      } : undefined,
      poll: item.poll ? {
        create: {
          question: item.poll.question,
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          options: {
            create: item.poll.options.map(([optionText, voteCount], optionIndex) => ({
              optionText,
              voteCount,
              optionOrder: optionIndex
            }))
          }
        }
      } : undefined
    }
  });
}

async function main() {
  const deletedSeedPosts = await clearPreviousSeedPosts();
  await updateUsers();

  for (let index = 0; index < posts.length; index += 1) {
    await createPost(posts[index], index);
  }

  console.log(JSON.stringify({
    deletedSeedPosts,
    updatedUsers: demoUsers.length,
    createdPosts: posts.length,
    postsWithMedia: posts.filter(post => post.media?.length).length,
    postsWithPolls: posts.filter(post => post.poll).length,
    language: 'en'
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
