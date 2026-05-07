const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PASSWORD = 'Arteo@2026';
const DOMAIN = 'arteosocial.com';

const uuid = (group, index) => `${group}-0000-0000-0000-${String(index).padStart(12, '0')}`;
const nowMinus = (minutes) => new Date(Date.now() - minutes * 60 * 1000);

const topics = [
  'Music',
  'Football',
  'Daily Life',
  'Books',
  'Photography',
  'Startups',
  'Design',
  'AI',
  'Food',
  'Travel',
  'Local',
  'Learning',
  'Work',
  'Culture',
  'Gaming',
  'Finance'
];

const people = [
  {
    uuid: uuid('70000000', 1),
    username: 'arteolab',
    email: 'arteolab@arteo.seed',
    fullName: 'Arteo Lab',
    headline: 'Feed and plugin studio',
    bio: 'Nhom san pham xay dung Arteo Library, feed ranking va cac plugin khoi dau cho cong dong.',
    avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=256&q=80',
    coverPhoto: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Product',
    location: 'Ho Chi Minh City',
    isVerified: true,
    isAdmin: true,
    role: 'admin'
  },
  {
    uuid: uuid('70000000', 2),
    username: 'linhmelody',
    email: 'linhmelody@arteo.seed',
    fullName: 'Linh Melody',
    headline: 'Indie pop songwriter',
    bio: 'Viet nhac ve thanh pho, demo luc dem va nhung san khau nho co khan gia that.',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Music',
    location: 'Ho Chi Minh City',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 3),
    username: 'minhvox',
    email: 'minhvox@arteo.seed',
    fullName: 'Minh Vox',
    headline: 'Vocal producer',
    bio: 'Phong thu nho, vocal layer, mix sach va nhung ban demo can them mot doi tai nghe.',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Music',
    location: 'Da Nang',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 4),
    username: 'hatranglive',
    email: 'hatranglive@arteo.seed',
    fullName: 'Ha Trang Live',
    headline: 'Acoustic singer',
    bio: 'Setlist, hau truong va nhung khoanh khac ca phong hat chung.',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Music',
    location: 'Ha Noi',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 5),
    username: 'quangstriker',
    email: 'quangstriker@arteo.seed',
    fullName: 'Quang Striker',
    headline: 'Football forward',
    bio: 'Toc do, di chuyen khong bong va nhung buoi tap sut sau gio.',
    avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Football',
    location: 'Ho Chi Minh City',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 6),
    username: 'anhtactics',
    email: 'anhtactics@arteo.seed',
    fullName: 'Anh Tactics',
    headline: 'Football analyst',
    bio: 'Doc tran dau qua pressing trigger, half-space va cach mot doi kiem soat nhip.',
    avatar: 'https://randomuser.me/api/portraits/men/57.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Football',
    location: 'Ha Noi',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 7),
    username: 'duykeeper',
    email: 'duykeeper@arteo.seed',
    fullName: 'Duy Keeper',
    headline: 'Goalkeeper and football creator',
    bio: 'Tap phan xa, doc tinh huong va ke chuyen doi thu mon.',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Football',
    location: 'Can Tho'
  },
  {
    uuid: uuid('70000000', 8),
    username: 'maicafe',
    email: 'maicafe@arteo.seed',
    fullName: 'Mai Cafe',
    headline: 'Cafe owner',
    bio: 'Ghi lai nhung buoi sang cham, goc ban quen va vai cuoc tro chuyen tu te.',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Daily Life',
    location: 'Da Lat'
  },
  {
    uuid: uuid('70000000', 9),
    username: 'namdaily',
    email: 'namdaily@arteo.seed',
    fullName: 'Nam Daily',
    headline: 'Work journal',
    bio: 'Viet ngan ve lam viec sau, lich sinh hoat va cach giu dau oc gon hon.',
    avatar: 'https://randomuser.me/api/portraits/men/71.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Work',
    location: 'Ho Chi Minh City'
  },
  {
    uuid: uuid('70000000', 10),
    username: 'hoabooks',
    email: 'hoabooks@arteo.seed',
    fullName: 'Hoa Books',
    headline: 'Reading notes',
    bio: 'Mot cuon sach, mot doan gach chan, mot cau hoi de nghi tiep.',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Books',
    location: 'Hue'
  },
  {
    uuid: uuid('70000000', 11),
    username: 'khanhphoto',
    email: 'khanhphoto@arteo.seed',
    fullName: 'Khanh Photo',
    headline: 'Street photographer',
    bio: 'Di bo, chup lai anh sang dep va nhung khoanh khac nho khong can on ao.',
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Photography',
    location: 'Hoi An',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 12),
    username: 'nhiux',
    email: 'nhiux@arteo.seed',
    fullName: 'Nhi UX',
    headline: 'Product designer',
    bio: 'Thich nhung giao dien khong can giai thich nhieu nhung dung la hieu ngay.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Design',
    location: 'Singapore',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 13),
    username: 'tuanfounder',
    email: 'tuanfounder@arteo.seed',
    fullName: 'Tuan Founder',
    headline: 'Early-stage founder',
    bio: 'Dang tu tay lam san pham, ban hang, ho tro nguoi dung va ghi lai bai hoc sau moi tuan.',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Startups',
    location: 'Bangkok'
  },
  {
    uuid: uuid('70000000', 14),
    username: 'irisaidev',
    email: 'irisaidev@arteo.seed',
    fullName: 'Iris AI',
    headline: 'AI engineer',
    bio: 'Build nho, eval that, log ro rang. Khong than thanh hoa AI, chi muon no co ich.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'AI',
    location: 'Tokyo',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 15),
    username: 'lamchef',
    email: 'lamchef@arteo.seed',
    fullName: 'Lam Chef',
    headline: 'Home cooking',
    bio: 'Com nha, nuoc dung, cho sang va nhung cong thuc co the lap lai.',
    avatar: 'https://randomuser.me/api/portraits/men/64.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Food',
    location: 'Da Nang'
  },
  {
    uuid: uuid('70000000', 16),
    username: 'thaoaway',
    email: 'thaoaway@arteo.seed',
    fullName: 'Thao Away',
    headline: 'Slow travel notes',
    bio: 'Di cham, o lai lau, viet ve cho an va duong ve nha tro.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Travel',
    location: 'Hoi An'
  },
  {
    uuid: uuid('70000000', 17),
    username: 'binhlocal',
    email: 'binhlocal@arteo.seed',
    fullName: 'Binh Local',
    headline: 'Local community notes',
    bio: 'Tin nho trong khu, quan moi mo, lop hoc cuoi tuan va nhung viec dang can nguoi phu.',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Local',
    location: 'Ha Noi'
  },
  {
    uuid: uuid('70000000', 18),
    username: 'sonlearning',
    email: 'sonlearning@arteo.seed',
    fullName: 'Son Learning',
    headline: 'Learning designer',
    bio: 'Thiet ke bai hoc nho, thuc hanh ngay va do luong bang hanh vi that.',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Learning',
    location: 'Ho Chi Minh City'
  },
  {
    uuid: uuid('70000000', 19),
    username: 'vyculture',
    email: 'vyculture@arteo.seed',
    fullName: 'Vy Culture',
    headline: 'Culture editor',
    bio: 'Phim cu, playlist moi, trien lam nho va nhung thu khong can viral van dang luu.',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Culture',
    location: 'Ha Noi'
  },
  {
    uuid: uuid('70000000', 20),
    username: 'kaigames',
    email: 'kaigames@arteo.seed',
    fullName: 'Kai Games',
    headline: 'Game community lead',
    bio: 'Patch note, guild nho, tournament cuoi tuan va cach giu community khoe.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Gaming',
    location: 'Seoul'
  },
  {
    uuid: uuid('70000000', 21),
    username: 'haifinance',
    email: 'haifinance@arteo.seed',
    fullName: 'Hai Finance',
    headline: 'Personal finance builder',
    bio: 'Noi ve tien bang ngu canh: gia dinh, rui ro, thoi gian va ky luat.',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Finance',
    location: 'Singapore'
  },
  {
    uuid: uuid('70000000', 22),
    username: 'ngocmaker',
    email: 'ngocmaker@arteo.seed',
    fullName: 'Ngoc Maker',
    headline: 'Hardware tinkerer',
    bio: 'Sua do cu, in 3D, mach nho va nhung loi ngu ngan dang ghi lai de lan sau do ton gio hon.',
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Maker',
    location: 'Da Nang'
  },
  {
    uuid: uuid('70000000', 23),
    username: 'phuongnews',
    email: 'phuongnews@arteo.seed',
    fullName: 'Phuong News',
    headline: 'Local reporter',
    bio: 'Tin dia phuong ngan gon, co nguon, co thoi gian, khong giat tieu de.',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Local',
    location: 'Hue',
    isVerified: true
  },
  {
    uuid: uuid('70000000', 24),
    username: 'longrunner',
    email: 'longrunner@arteo.seed',
    fullName: 'Long Runner',
    headline: 'Amateur runner',
    bio: 'Chay bo sau gio lam, an du, ngu du, tang pace cham nhung ben.',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Fitness',
    location: 'Ho Chi Minh City'
  }
];

const pluginSpecs = [
  {
    uuid: uuid('73000000', 1),
    name: 'Quality Ranking Kit',
    category: 'Algorithm',
    description: 'Ranking blocks for freshness, conversation quality, media depth, save value, and low-effort reduction.',
    version: '2.1.0',
    tags: ['quality', 'ranking', 'freshness'],
    blocks: [
      { id: 'fresh_relevance', name: 'Fresh relevance', type: 'score', description: 'Boosts recent posts without burying strong older posts.' },
      { id: 'conversation_depth', name: 'Conversation depth', type: 'score', description: 'Rewards replies, quotes, and meaningful discussion.' },
      { id: 'media_depth', name: 'Media depth', type: 'boost', description: 'Rewards original media, galleries, and watchable video.' },
      { id: 'save_value', name: 'Save value', type: 'score', description: 'Detects posts people bookmark or return to.' },
      { id: 'low_effort_guard', name: 'Low effort guard', type: 'filter', description: 'Reduces empty, duplicate, or clickbait-like posts.' }
    ]
  },
  {
    uuid: uuid('73000000', 2),
    name: 'Topic Persona Kit',
    category: 'Discovery',
    description: 'Discovery blocks for music, football, daily life, books, photography, work, and mixed-interest home feeds.',
    version: '2.1.0',
    tags: ['topic', 'music', 'football', 'lifestyle'],
    blocks: [
      { id: 'music_listener_match', name: 'Music listener match', type: 'topic', description: 'Finds songs, shows, studio notes, and artists.' },
      { id: 'football_tactics_match', name: 'Football tactics match', type: 'topic', description: 'Finds football analysis, training, and match context.' },
      { id: 'daily_life_match', name: 'Daily life match', type: 'topic', description: 'Keeps calm personal updates in the feed.' },
      { id: 'books_learning_match', name: 'Books and learning match', type: 'topic', description: 'Surfaces reading notes and study reflections.' },
      { id: 'photo_visual_match', name: 'Photo visual match', type: 'topic', description: 'Rewards everyday photography and visual storytelling.' }
    ]
  },
  {
    uuid: uuid('73000000', 3),
    name: 'Safety Diversity Kit',
    category: 'Moderation',
    description: 'Safety and diversity blocks for anti-spam, duplicate reduction, author rotation, topic balance, and healthy exploration.',
    version: '2.1.0',
    tags: ['safety', 'diversity', 'anti-spam'],
    blocks: [
      { id: 'spam_filter', name: 'Spam filter', type: 'filter', description: 'Filters scam, spam, and engagement bait signals.' },
      { id: 'author_diversity', name: 'Author diversity', type: 'diversity', description: 'Avoids one author taking over the feed.' },
      { id: 'topic_diversity', name: 'Topic diversity', type: 'diversity', description: 'Avoids topic repetition inside a single page.' },
      { id: 'duplicate_collapse', name: 'Duplicate collapse', type: 'filter', description: 'Reduces repeated posts and near-identical repost waves.' }
    ]
  }
];

const feedSpecs = [
  {
    uuid: uuid('74000000', 1),
    name: 'Community Pulse',
    description: 'A living home feed: fresh posts, real replies, author diversity, and enough topic variety to feel social.',
    tags: ['home', 'community', 'fresh'],
    dependencies: [pluginSpecs[0], pluginSpecs[2]],
    pipeline: [
      `use ${pluginSpecs[0].uuid}:fresh_relevance()`,
      `use ${pluginSpecs[0].uuid}:conversation_depth()`,
      `use ${pluginSpecs[2].uuid}:author_diversity()`,
      `use ${pluginSpecs[2].uuid}:topic_diversity()`,
      'boost recent by 28',
      'boost popular by 8'
    ]
  },
  {
    uuid: uuid('74000000', 2),
    name: 'Music & Match Day',
    description: 'For people who want songs, shows, football training, and tactical notes in one active timeline.',
    tags: ['music', 'football', 'creator'],
    dependencies: [pluginSpecs[0], pluginSpecs[1]],
    pipeline: [
      `use ${pluginSpecs[1].uuid}:music_listener_match()`,
      `use ${pluginSpecs[1].uuid}:football_tactics_match()`,
      `use ${pluginSpecs[0].uuid}:conversation_depth()`,
      'boost media by 18',
      'boost recent by 22'
    ]
  },
  {
    uuid: uuid('74000000', 3),
    name: 'Quiet Morning',
    description: 'A calmer feed for cafe notes, reading, daily work, local context, and thoughtful posts.',
    tags: ['daily', 'books', 'calm'],
    dependencies: [pluginSpecs[1], pluginSpecs[2]],
    pipeline: [
      `use ${pluginSpecs[1].uuid}:daily_life_match()`,
      `use ${pluginSpecs[1].uuid}:books_learning_match()`,
      `use ${pluginSpecs[2].uuid}:duplicate_collapse()`,
      'boost recent by 18'
    ]
  },
  {
    uuid: uuid('74000000', 4),
    name: 'Creator Lens',
    description: 'Prioritizes media, photography, maker notes, and posts that people save for later.',
    tags: ['media', 'photo', 'maker'],
    dependencies: [pluginSpecs[0], pluginSpecs[1]],
    pipeline: [
      `use ${pluginSpecs[1].uuid}:photo_visual_match()`,
      `use ${pluginSpecs[0].uuid}:media_depth()`,
      `use ${pluginSpecs[0].uuid}:save_value()`,
      'boost media by 24'
    ]
  }
];

const posts = [
  ['linhmelody', 'Music', 'Thu lai chorus luc 1 gio sang va bat ngo la ban nho giong lai dung hon ban hat lon. Co le bai nay can de khoang trong nhieu hon. #Music', ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80'], 18],
  ['minhvox', 'Music', 'Vocal R&B khong chi la chay note. Phan kho hon la de cau hat dap xuong dung cho, dung hoi tho, dung im lang. #Studio', ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=80'], 31],
  ['hatranglive', 'Music', 'Show acoustic toi qua co mot khoanh khac ca phong im khi bridge bat dau. Live music lam minh tin vao cong dong hon moi dashboard nao. #Live', ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80'], 47],
  ['quangstriker', 'Football', 'Buoi tap hom nay chi tap mot thu: chay cat sau lung trung ve. Khong bong moi la luc tien dao tao ra ban thang. #Football', ['https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1400&q=80'], 52],
  ['anhtactics', 'Football', 'Diem hay cua tran toi qua khong phai ban thang, ma la cach doi chu nha khoa duong tra nguoc vao half-space. #Tactics', ['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80'], 64],
  ['duykeeper', 'Football', 'Thu mon khong phan xa bang tay truoc, ma bang vi tri. Dung dung goc thi cu cuu thua nhin don gian hon thuc te rat nhieu. #Training', ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80'], 78],
  ['maicafe', 'Daily Life', 'Quan mo tu 6 gio. Ca phe dau tien cua ngay co mot thu rat rieng: chua on, chua voi, chi co tieng may xay va vai nguoi quen. #Daily', ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80'], 83],
  ['namdaily', 'Work', 'Lich lam viec hom nay: 90 phut tap trung, 15 phut nghi, tat thong bao den trua. Khong hoanh trang nhung cuu ca ngay. #Work', [], 96],
  ['hoabooks', 'Books', 'Gach chan hom nay: mot y tuong tot khong can on ao, no chi can quay lai dung luc minh can. Doc cham hon nhung nho lau hon. #Books', ['https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80'], 104],
  ['khanhphoto', 'Photography', 'Anh sang dep nhat buoi chieu nay nam tren mot buc tuong cu. Khong can filter nhieu, chi can dung dung cho them vai phut. #Photo', ['https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80'], 121],
  ['nhiux', 'Design', 'Nut “Download” trong Arteo nen nghia la tai vao Library de dung. Xuat file/source phai goi la “Export source”. Copy dung giup user doan duoc hanh dong. #Design', [], 137],
  ['tuanfounder', 'Startups', 'Mot ngay founder be ti: 2 bug, 1 user phan hoi rat dung, 1 cuoc goi ban hang hoi dai, va 30 phut viet lai onboarding. #Startups', [], 146],
  ['irisaidev', 'AI', 'Feed AI ma chi day bai nhieu like thi som muon thanh loa. Mot feed tot can bai moi, nguoi nho, chu de lech, va cach giai thich vi sao bai hien len. #AI', [], 160],
  ['lamchef', 'Food', 'Nuoc dung hom nay on hon vi minh dung rang hanh lau hon 4 phut. Nau an nhieu khi la ghi log that ky. #Food', ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80'], 184],
  ['thaoaway', 'Travel', 'Hoi An sau 8 gio toi khong can them lich trinh. Di bo cham, an mot dia cao lau, nghe nguoi ban hang ke ve mua mua. #Travel', ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80'], 207],
  ['binhlocal', 'Local', 'Cuoi tuan nay khu minh co lop sua xe dap mien phi cho hoc sinh. Ai co do nghe cu dung duoc thi mang qua nha van hoa luc 8 gio. #Local', [], 226],
  ['sonlearning', 'Learning', 'Bai hoc tot nen co mot viec lam duoc ngay. Neu hoc xong chi thay “hay qua” ma khong biet lam gi tiep thi van chua xong. #Learning', [], 240],
  ['vyculture', 'Culture', 'Khong phai moi thu deu can thanh trend. Co nhung bai chi can dung nguoi doc duoc la du. #Culture', ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80'], 264],
  ['kaigames', 'Gaming', 'Patch note hay giong nhat ky phat trien: sua gi, bo gi, dang so gi. Community game can nhieu bai nhu vay hon clip nong. #Gaming', ['https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80'], 290],
  ['haifinance', 'Finance', 'Noi ve tien ma thieu thoi gian, gia dinh, rui ro va gia dinh thi de thanh khau hieu. Minh muon post tai chinh co ngu canh hon. #Finance', [], 318],
  ['ngocmaker', 'Work', 'In 3D that bai vi minh tiet kiem 6 phut can bed. Mat 2 gio sua. Log lai de lan sau bot thong minh hon. #Maker', ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80'], 352],
  ['phuongnews', 'Local', 'Tin nho: duong Nguyen Van Troi se cat dien 45 phut sang mai de sua tram. Quan ca phe dau hem da dan thong bao nghi sang. #Local', [], 380],
  ['longrunner', 'Daily Life', '5km sang nay cham hon binh thuong nhung nhip tim dep. Co ngay chi can di dung lich, khong can pha ky luc. #Run', ['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1400&q=80'], 415],
  ['arteolab', 'AI', 'Seed moi cua Arteo tao mot mang xa hoi co nguoi dung, follow, bai viet, reply, quote, media, poll va interaction that hon. Khong con timeline bot 300 bai giong nhau.', [], 430],
  ['linhmelody', 'Music', 'Setlist cuoi tuan: mot bai cu, hai bai chua phat hanh, va mot doan sing-along de moi nguoi hat chung. San khau nho nhung nang luong that. #Music', [], 465],
  ['anhtactics', 'Football', 'Neu feed the thao chi xep theo like, phan tich sau se thua clip giat gan. Thuat toan nen danh cho bai co ngu canh mot co hoi. #Football', [], 510],
  ['maicafe', 'Daily Life', 'Minh thich nhung bai dang doi thuong vi chung lam mang xa hoi bot giong san khau. Khong phai ngay nao cung can thanh tuu lon. #Daily', [], 550],
  ['nhiux', 'Design', 'Trang list tot phai cho biet ngay: cai nay cua ai, da tai chua, hanh dong tiep theo la gi. Detail page thi phai cho thay nguon that, block that, dependency that. #UX', [], 590],
  ['irisaidev', 'AI', 'White-box ranking khong can giai thich dai. Chi can noi feed nao, rule nao da chay, plugin nao duoc dung, va score co y nghia gi. #AI', [], 640],
  ['khanhphoto', 'Photography', 'Anh doi thuong hay o cho no khong ep nguoi xem phai ngac nhien. No chi giu lai mot khoanh khac du that. #Photo', [], 700]
];

const comments = [
  [4, 'anhtactics', 'Cau “khong bong tao ra ban thang” dung that. Chay sai thoi diem la hau ve nhan ra ngay.'],
  [4, 'duykeeper', 'Tu goc thu mon minh so nhat kieu tien dao chay cheo sau lung nhu vay.'],
  [1, 'minhvox', 'De khoang trong nhieu hon nghe dung. Bai nao cung day track thi vocal khong con cho dung.'],
  [3, 'linhmelody', 'Doc xong muon di nghe live lien. Cau bridge im lang la khoanh khac vang.'],
  [7, 'namdaily', 'Post nay lam minh muon ra quan truoc 7 gio de ngoi lam viec.'],
  [9, 'sonlearning', 'Cong thuc 3 dong nay hay. Minh se thu voi ghi chu bai hoc tuan nay.'],
  [11, 'arteolab', 'Dong y. Trong product copy, sai mot tu la user hieu sai hanh dong.'],
  [13, 'nhiux', 'Giai thich feed tren post detail nen hien o dung luc, khong can day vao mat.'],
  [16, 'phuongnews', 'Minh co vai do nghe sua xe, de mai mang qua nha van hoa.'],
  [18, 'hoabooks', 'Cau nay nen gan vao feed Culture. Khong viral van co gia tri.'],
  [23, 'longrunner', 'Ngay cham ma dung lich la ngay thang roi.'],
  [28, 'tuanfounder', 'List page ma ro hanh dong thi support giam mot nua that.']
];

const quotes = [
  [11, 'arteolab', 'Chuan hoa lai ngon ngu san pham: Download la tai vao Library de dung, Export source moi la xuat file.'],
  [13, 'sonlearning', 'Bai nay dung voi giao duc nua: he thong can noi ro vi sao noi dung xuat hien.'],
  [26, 'quangstriker', 'Feed bong da ma biet uu tien phan tich sau thi minh dung hang ngay.'],
  [30, 'vyculture', 'Anh doi thuong la ly do minh van thich mang xa hoi neu no duoc sap xep tu te.']
];

const polls = [
  {
    postIndex: 24,
    question: 'Seed moi nen uu tien cam giac nao truoc?',
    options: ['Nguoi dung that', 'Bai viet co ngu canh', 'Interaction day du', 'Feed/plugin dung chuan'],
    votes: [9, 6, 5, 8]
  },
  {
    postIndex: 11,
    question: 'Ten hanh dong nao de hieu nhat?',
    options: ['Download to Library', 'Install', 'Import', 'Add'],
    votes: [14, 3, 2, 4]
  }
];

const seededUserIds = people.map((user) => user.uuid);
const seededPostIds = [
  ...posts.map((_, index) => uuid('71000000', index + 1)),
  ...comments.map((_, index) => uuid('71100000', index + 1)),
  ...quotes.map((_, index) => uuid('71200000', index + 1))
];

const previousBotUserIds = () => Array.from({ length: 100 }, (_, index) => uuid('20000000', index + 1));
const previousEcosystemUserIds = () => Array.from({ length: 32 }, (_, index) => uuid('30000000', index));
const previousGenericPostIds = () => Array.from({ length: 300 }, (_, index) => uuid('40000000', index + 1));
const previousQualityPostIds = () => Array.from({ length: 40 }, (_, index) => uuid('41000000', index + 1));

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseHashtags(content) {
  return Array.from(new Set((content.match(/#[\p{L}\p{N}_]+/gu) || []).map(tag => tag.slice(1).toLowerCase())));
}

async function cleanupPreviousSeed() {
  await prisma.post.deleteMany({
    where: { uuid: { in: [...seededPostIds, ...previousGenericPostIds(), ...previousQualityPostIds()] } }
  });
  await prisma.follow.deleteMany({
    where: { OR: [{ followerId: { in: seededUserIds } }, { followingId: { in: seededUserIds } }] }
  });
  await prisma.user.deleteMany({
    where: { uuid: { in: [...previousBotUserIds(), ...previousEcosystemUserIds()] } }
  });
}

async function upsertTopics() {
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic },
      update: { slug: slugify(topic) },
      create: { uuid: uuid('76000000', topics.indexOf(topic) + 1), name: topic, slug: slugify(topic) }
    });
  }
}

async function upsertUsers(passwordHash) {
  for (const person of people) {
    await prisma.user.upsert({
      where: { uuid: person.uuid },
      update: {
        username: person.username,
        identityDomain: DOMAIN,
        email: person.email,
        password: passwordHash,
        fullName: person.fullName,
        headline: person.headline,
        bio: person.bio,
        avatar: person.avatar,
        coverPhoto: person.coverPhoto,
        professionalCategory: person.professionalCategory,
        location: person.location,
        systemLocation: person.location,
        isVerified: Boolean(person.isVerified),
        isAdmin: Boolean(person.isAdmin),
        role: person.role || 'user',
        emailVerified: true,
        status: 'ACTIVE',
        language: 'vn',
        deletedAt: null
      },
      create: {
        uuid: person.uuid,
        username: person.username,
        identityDomain: DOMAIN,
        email: person.email,
        password: passwordHash,
        fullName: person.fullName,
        headline: person.headline,
        bio: person.bio,
        avatar: person.avatar,
        coverPhoto: person.coverPhoto,
        professionalCategory: person.professionalCategory,
        location: person.location,
        systemLocation: person.location,
        isVerified: Boolean(person.isVerified),
        isAdmin: Boolean(person.isAdmin),
        role: person.role || 'user',
        emailVerified: true,
        status: 'ACTIVE',
        language: 'vn'
      }
    });
  }

  return prisma.user.findMany({ where: { uuid: { in: seededUserIds } } });
}

async function createFollows(users) {
  const byUsername = new Map(users.map((user) => [user.username, user]));
  const edges = new Set();
  const add = (from, to) => {
    if (from === to) return;
    const follower = byUsername.get(from);
    const following = byUsername.get(to);
    if (!follower || !following) return;
    edges.add(`${follower.uuid}:${following.uuid}`);
  };

  const usernames = people.map((person) => person.username);
  usernames.forEach((username, index) => {
    [1, 2, 4, 7].forEach(step => add(username, usernames[(index + step) % usernames.length]));
    add(username, 'arteolab');
  });

  [
    ['linhmelody', 'minhvox'], ['linhmelody', 'hatranglive'], ['minhvox', 'linhmelody'], ['hatranglive', 'linhmelody'],
    ['quangstriker', 'anhtactics'], ['quangstriker', 'duykeeper'], ['anhtactics', 'quangstriker'], ['duykeeper', 'anhtactics'],
    ['maicafe', 'namdaily'], ['namdaily', 'maicafe'], ['hoabooks', 'sonlearning'], ['sonlearning', 'hoabooks'],
    ['khanhphoto', 'nhiux'], ['nhiux', 'khanhphoto'], ['irisaidev', 'arteolab'], ['arteolab', 'irisaidev'],
    ['phuongnews', 'binhlocal'], ['binhlocal', 'phuongnews'], ['longrunner', 'lamchef'], ['lamchef', 'longrunner']
  ].forEach(([from, to]) => add(from, to));

  await prisma.follow.createMany({
    data: Array.from(edges).map((edge, index) => {
      const [followerId, followingId] = edge.split(':');
      return { uuid: uuid('72000000', index + 1), followerId, followingId };
    }),
    skipDuplicates: true
  });
}

async function upsertPlugins(users) {
  const owner = users.find(user => user.username === 'arteolab') || users[0];
  for (const plugin of pluginSpecs) {
    await prisma.plugin.upsert({
      where: { uuid: plugin.uuid },
      update: {
        authorId: owner.uuid,
        name: plugin.name,
        description: plugin.description,
        category: plugin.category,
        isPublic: true,
        version: plugin.version,
        tags: plugin.tags,
        blocksMetadata: plugin.blocks,
        installedFromId: null,
        deletedAt: null,
        code: buildPluginCode(plugin)
      },
      create: {
        uuid: plugin.uuid,
        authorId: owner.uuid,
        name: plugin.name,
        description: plugin.description,
        category: plugin.category,
        isPublic: true,
        version: plugin.version,
        tags: plugin.tags,
        blocksMetadata: plugin.blocks,
        code: buildPluginCode(plugin)
      }
    });
  }
}

function buildPluginCode(plugin) {
  const blocks = plugin.blocks.map(block => [
    `  block "${block.name}" {`,
    `    id "${block.id}"`,
    `    type "${block.type}"`,
    `    description "${block.description}"`,
    '  }'
  ].join('\n')).join('\n\n');

  return [
    `plugin "${plugin.name}" {`,
    `  category "${plugin.category}"`,
    `  description "${plugin.description}"`,
    `  version "${plugin.version}"`,
    `  tags ${JSON.stringify(plugin.tags)}`,
    '',
    blocks,
    '}'
  ].join('\n');
}

async function upsertFeeds(users) {
  const owner = users.find(user => user.username === 'arteolab') || users[0];
  for (const feed of feedSpecs) {
    const pipeline = [
      `algorithm "${feed.name}" {`,
      `  version "1.0.0"`,
      `  description "${feed.description}"`,
      '',
      '  pipeline "Home" {',
      ...feed.pipeline.map(line => `    ${line}`),
      '  }',
      '}'
    ].join('\n');
    const dependencies = feed.dependencies.map(plugin => ({
      sourcePluginId: plugin.uuid,
      localPluginId: plugin.uuid,
      name: plugin.name,
      version: plugin.version,
      blockCount: plugin.blocks.length
    }));

    await prisma.userAlgorithm.upsert({
      where: { uuid: feed.uuid },
      update: {
        userId: owner.uuid,
        name: feed.name,
        shortDescription: feed.description.slice(0, 240),
        description: feed.description,
        weights: { pluginDependencies: dependencies },
        pipeline,
        isActive: feed.uuid === feedSpecs[0].uuid,
        isPublic: true,
        isPinned: feed.uuid === feedSpecs[0].uuid,
        pinOrder: feed.uuid === feedSpecs[0].uuid ? 1 : 0,
        version: '1.0.0',
        tags: feed.tags,
        installedFromId: null,
        deletedAt: null
      },
      create: {
        uuid: feed.uuid,
        userId: owner.uuid,
        name: feed.name,
        shortDescription: feed.description.slice(0, 240),
        description: feed.description,
        weights: { pluginDependencies: dependencies },
        pipeline,
        isActive: feed.uuid === feedSpecs[0].uuid,
        isPublic: true,
        isPinned: feed.uuid === feedSpecs[0].uuid,
        pinOrder: feed.uuid === feedSpecs[0].uuid ? 1 : 0,
        version: '1.0.0',
        tags: feed.tags,
        usageCount: 1200 - feedSpecs.indexOf(feed) * 137
      }
    });
  }
}

async function createPosts(users) {
  const byUsername = new Map(users.map((user) => [user.username, user]));
  const topicRows = await prisma.topic.findMany();
  const topicByName = new Map(topicRows.map((topic) => [topic.name, topic]));
  const createdPosts = [];

  for (let index = 0; index < posts.length; index += 1) {
    const [username, topic, content, mediaUrls, minutesAgo] = posts[index];
    const user = byUsername.get(username);
    if (!user) throw new Error(`Seed user not found: ${username}`);
    const postId = uuid('71000000', index + 1);
    const post = await prisma.post.create({
      data: {
        uuid: postId,
        userId: user.uuid,
        type: 'POST',
        content,
        topic,
        topicId: topicByName.get(topic)?.uuid,
        location: user.location,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        trendingScore: 1000 - minutesAgo,
        createdAt: nowMinus(minutesAgo),
        media: {
          create: mediaUrls.map((url, mediaIndex) => ({
            type: 'IMAGE',
            url,
            displayOrder: mediaIndex,
            mimeType: 'image/jpeg',
            width: 1400,
            height: 933
          }))
        }
      }
    });
    createdPosts.push(post);
    await connectHashtags(postId, content);
  }

  for (let index = 0; index < comments.length; index += 1) {
    const [postIndex, username, content] = comments[index];
    const user = byUsername.get(username);
    const parent = createdPosts[postIndex - 1];
    if (!user || !parent) continue;
    const post = await prisma.post.create({
      data: {
        uuid: uuid('71100000', index + 1),
        userId: user.uuid,
        type: 'COMMENT',
        parentId: parent.uuid,
        content,
        topic: parent.topic,
        topicId: parent.topicId,
        location: user.location,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(parent.createdAt.getTime() + (index + 1) * 4 * 60 * 1000)
      }
    });
    await connectHashtags(post.uuid, content);
  }

  for (let index = 0; index < quotes.length; index += 1) {
    const [postIndex, username, content] = quotes[index];
    const user = byUsername.get(username);
    const original = createdPosts[postIndex - 1];
    if (!user || !original) continue;
    const post = await prisma.post.create({
      data: {
        uuid: uuid('71200000', index + 1),
        userId: user.uuid,
        type: 'QUOTE',
        originalPostId: original.uuid,
        content,
        topic: original.topic,
        topicId: original.topicId,
        location: user.location,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(original.createdAt.getTime() + (index + 1) * 7 * 60 * 1000)
      }
    });
    await connectHashtags(post.uuid, content);
  }

  await createPolls(byUsername);
  await createInteractions(users, createdPosts);
}

async function connectHashtags(postId, content) {
  const tags = parseHashtags(content);
  for (const tag of tags) {
    const hashtag = await prisma.hashtag.upsert({
      where: { name: tag },
      update: { useCount: { increment: 1 }, lastUsed: new Date() },
      create: { name: tag, useCount: 1, lastUsed: new Date() }
    });
    await prisma.postHashtag.create({
      data: { postId, hashtagId: hashtag.uuid }
    }).catch(() => {});
  }
}

async function createPolls(byUsername) {
  for (let index = 0; index < polls.length; index += 1) {
    const pollSeed = polls[index];
    const postId = uuid('71000000', pollSeed.postIndex);
    const poll = await prisma.poll.create({
      data: {
        uuid: uuid('71300000', index + 1),
        postId,
        question: pollSeed.question,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    });

    const options = [];
    for (let optionIndex = 0; optionIndex < pollSeed.options.length; optionIndex += 1) {
      const option = await prisma.pollOption.create({
        data: {
          uuid: uuid(`714${String(index).padStart(5, '0')}`, optionIndex + 1),
          pollId: poll.uuid,
          optionText: pollSeed.options[optionIndex],
          optionOrder: optionIndex,
          voteCount: pollSeed.votes[optionIndex] || 0
        }
      });
      options.push(option);
    }

    const voters = Array.from(byUsername.values()).filter(user => user.username !== 'arteolab');
    let voterIndex = 0;
    for (let optionIndex = 0; optionIndex < options.length; optionIndex += 1) {
      const voteCount = pollSeed.votes[optionIndex] || 0;
      for (let vote = 0; vote < voteCount && voterIndex < voters.length; vote += 1) {
        await prisma.pollVote.create({
          data: {
            userId: voters[voterIndex].uuid,
            pollId: poll.uuid,
            optionUuid: options[optionIndex].uuid
          }
        }).catch(() => {});
        voterIndex += 1;
      }
    }
  }
}

async function createInteractions(users, topPosts) {
  const likes = [];
  const bookmarks = [];
  const reposts = [];
  const reactions = [];
  const emojis = ['spark', 'thoughtful', 'fire', 'save', 'agree'];

  topPosts.forEach((post, postIndex) => {
    users.forEach((user, userIndex) => {
      if (user.uuid === post.userId) return;
      const signal = (postIndex * 11 + userIndex * 7) % 17;
      if (signal < 9) likes.push({ userId: user.uuid, postId: post.uuid, createdAt: nowMinus(10 + postIndex + userIndex) });
      if (signal === 2 || signal === 6 || signal === 10) bookmarks.push({ userId: user.uuid, postId: post.uuid, createdAt: nowMinus(14 + postIndex + userIndex) });
      if (signal === 3 || signal === 12) reposts.push({ userId: user.uuid, postId: post.uuid, createdAt: nowMinus(18 + postIndex + userIndex) });
      if (signal === 1 || signal === 8) reactions.push({ userId: user.uuid, postId: post.uuid, emoji: emojis[(postIndex + userIndex) % emojis.length], createdAt: nowMinus(12 + postIndex + userIndex) });
    });
  });

  await prisma.like.createMany({ data: likes, skipDuplicates: true });
  await prisma.bookmark.createMany({ data: bookmarks, skipDuplicates: true });
  await prisma.repost.createMany({ data: reposts, skipDuplicates: true });
  await prisma.reaction.createMany({ data: reactions, skipDuplicates: true });

  const allSeedPosts = await prisma.post.findMany({
    where: { uuid: { in: seededPostIds } },
    select: { uuid: true }
  });
  const postIds = allSeedPosts.map(post => post.uuid);
  const [likeGroups, repostGroups, bookmarkGroups, quoteGroups, replyGroups] = await Promise.all([
    prisma.like.groupBy({ by: ['postId'], where: { postId: { in: postIds } }, _count: { _all: true } }),
    prisma.repost.groupBy({ by: ['postId'], where: { postId: { in: postIds } }, _count: { _all: true } }),
    prisma.bookmark.groupBy({ by: ['postId'], where: { postId: { in: postIds } }, _count: { _all: true } }),
    prisma.post.groupBy({ by: ['originalPostId'], where: { originalPostId: { in: postIds }, deletedAt: null }, _count: { _all: true } }),
    prisma.post.groupBy({ by: ['parentId'], where: { parentId: { in: postIds }, deletedAt: null }, _count: { _all: true } })
  ]);

  const toCountMap = (rows, key) => new Map(rows.map(row => [row[key], row._count._all]));
  const likeMap = toCountMap(likeGroups, 'postId');
  const repostMap = toCountMap(repostGroups, 'postId');
  const bookmarkMap = toCountMap(bookmarkGroups, 'postId');
  const quoteMap = toCountMap(quoteGroups.filter(row => row.originalPostId), 'originalPostId');
  const replyMap = toCountMap(replyGroups.filter(row => row.parentId), 'parentId');

  await prisma.postStat.createMany({
    data: postIds.map(postId => {
      const likeCount = likeMap.get(postId) || 0;
      const repostCount = repostMap.get(postId) || 0;
      const quoteCount = quoteMap.get(postId) || 0;
      const replyCount = replyMap.get(postId) || 0;
      const bookmarkCount = bookmarkMap.get(postId) || 0;
      return {
        postId,
        likeCount,
        repostCount,
        quoteCount,
        replyCount,
        bookmarkCount,
        viewCount: 450 + likeCount * 73 + repostCount * 121 + quoteCount * 157 + replyCount * 89
      };
    }),
    skipDuplicates: true
  });
}

async function main() {
  console.log('--- Seeding Arteo living social network ---');
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  await cleanupPreviousSeed();
  await upsertTopics();
  const users = await upsertUsers(passwordHash);
  await createFollows(users);
  await upsertPlugins(users);
  await upsertFeeds(users);
  await createPosts(users);

  const [userCount, postCount, followCount, likeCount, repostCount, pluginCount, feedCount] = await Promise.all([
    prisma.user.count({ where: { uuid: { in: seededUserIds } } }),
    prisma.post.count({ where: { uuid: { in: seededPostIds } } }),
    prisma.follow.count({ where: { followerId: { in: seededUserIds } } }),
    prisma.like.count({ where: { postId: { in: seededPostIds } } }),
    prisma.repost.count({ where: { postId: { in: seededPostIds } } }),
    prisma.plugin.count({ where: { uuid: { in: pluginSpecs.map(plugin => plugin.uuid) } } }),
    prisma.userAlgorithm.count({ where: { uuid: { in: feedSpecs.map(feed => feed.uuid) } } })
  ]);

  console.log(JSON.stringify({
    users: userCount,
    posts: postCount,
    follows: followCount,
    likes: likeCount,
    reposts: repostCount,
    plugins: pluginCount,
    feeds: feedCount,
    password: PASSWORD,
    note: 'Seeded accounts are fictional humans with posts, replies, quotes, media, polls, and realistic interactions.'
  }, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  });
