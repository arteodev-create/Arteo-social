const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const PASSWORD = 'Arteo@2026';
const DOMAIN = 'arteosocial.com';

const owner = {
  uuid: '30000000-0000-0000-0000-000000000000',
  username: 'arteolab',
  email: 'arteolab@arteo.demo',
  fullName: 'Arteo Lab',
  headline: 'Plugin and algorithm studio',
  bio: 'Tài khoản hệ thống dùng để xuất bản plugin, thuật toán và dữ liệu demo chất lượng cho Arteo.',
  avatar: 'https://api.dicebear.com/8.x/shapes/svg?seed=arteolab',
  location: 'Arteo Network',
  professionalCategory: 'System'
};

const demoUsers = [
  {
    uuid: '30000000-0000-0000-0000-000000000001',
    username: 'linhmelody',
    email: 'linhmelody@arteo.demo',
    fullName: 'Linh Melody',
    headline: 'Ca sĩ indie pop',
    bio: 'Viết nhạc về thành phố, những đêm diễn nhỏ và cảm giác bắt đầu lại.',
    avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Music',
    location: 'Ho Chi Minh City'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000002',
    username: 'minhvox',
    email: 'minhvox@arteo.demo',
    fullName: 'Minh Vox',
    headline: 'Ca sĩ R&B / vocal producer',
    bio: 'Phòng thu nhỏ, vocal layer, và những bản demo lúc 2 giờ sáng.',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Music',
    location: 'Da Nang'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000003',
    username: 'hatranglive',
    email: 'hatranglive@arteo.demo',
    fullName: 'Hà Trang Live',
    headline: 'Ca sĩ live acoustic',
    bio: 'Mang sân khấu nhỏ lên timeline: setlist, hậu trường và vài câu chuyện sau mỗi show.',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Music',
    location: 'Ha Noi'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000004',
    username: 'quangstriker',
    email: 'quangstriker@arteo.demo',
    fullName: 'Quang Striker',
    headline: 'Tiền đạo bóng đá',
    bio: 'Tốc độ, di chuyển không bóng và những buổi tập sút sau giờ.',
    avatar: 'https://randomuser.me/api/portraits/men/18.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Football',
    location: 'Ho Chi Minh City'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000005',
    username: 'anhtactics',
    email: 'anhtactics@arteo.demo',
    fullName: 'Anh Tactics',
    headline: 'Phân tích chiến thuật bóng đá',
    bio: 'Nhìn trận đấu qua pressing trigger, half-space và cách một đội kiểm soát nhịp.',
    avatar: 'https://randomuser.me/api/portraits/men/57.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Football',
    location: 'Ha Noi'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000006',
    username: 'duykeeper',
    email: 'duykeeper@arteo.demo',
    fullName: 'Duy Keeper',
    headline: 'Thủ môn và creator bóng đá',
    bio: 'Tập phản xạ, đọc tình huống và kể chuyện đời thủ môn.',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Football',
    location: 'Can Tho'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000007',
    username: 'maicafe',
    email: 'maicafe@arteo.demo',
    fullName: 'Mai Cafe',
    headline: 'Chuyện quán nhỏ và cà phê sáng',
    bio: 'Ghi lại những buổi sáng chậm, góc bàn quen và vài cuộc trò chuyện tử tế.',
    avatar: 'https://randomuser.me/api/portraits/women/26.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Lifestyle',
    location: 'Da Lat'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000008',
    username: 'namdaily',
    email: 'namdaily@arteo.demo',
    fullName: 'Nam Daily',
    headline: 'Nhật ký công việc và cuộc sống',
    bio: 'Viết ngắn về làm việc sâu, lịch sinh hoạt và cách giữ đầu óc gọn hơn.',
    avatar: 'https://randomuser.me/api/portraits/men/71.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Daily',
    location: 'Ho Chi Minh City'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000009',
    username: 'hoabooks',
    email: 'hoabooks@arteo.demo',
    fullName: 'Hoa Books',
    headline: 'Đọc sách và ghi chú học tập',
    bio: 'Một cuốn sách, một đoạn gạch chân, một câu hỏi để nghĩ tiếp.',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Books',
    location: 'Hue'
  },
  {
    uuid: '30000000-0000-0000-0000-000000000010',
    username: 'khanhphoto',
    email: 'khanhphoto@arteo.demo',
    fullName: 'Khánh Photo',
    headline: 'Ảnh đời thường và phố',
    bio: 'Đi bộ, chụp lại ánh sáng đẹp và những khoảnh khắc nhỏ không cần ồn ào.',
    avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
    coverPhoto: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80',
    professionalCategory: 'Photography',
    location: 'Hoi An'
  }
];

const posts = [
  ['30000000-0000-0000-0000-000000000001', 'Music', 'Tối nay mình thu lại bản demo mới. Verse đầu giữ rất nhỏ, chorus mở ra như một con phố sau mưa. Indie pop hay nhất khi nó đủ gần để nghe thấy hơi thở.', ['https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80'], 87, 14, 3200],
  ['30000000-0000-0000-0000-000000000001', 'Music', 'Setlist cho cuối tuần: một bài cũ, hai bài chưa phát hành, và một đoạn sing-along để mọi người hát chung. Mình thích cảm giác sân khấu nhỏ nhưng năng lượng thật.', [], 56, 9, 2100],
  ['30000000-0000-0000-0000-000000000002', 'Music', 'Vocal R&B không chỉ là chạy note. Quan trọng là khoảng lặng, hơi thở và cách câu hát đáp xuống đúng chỗ. Mix hôm nay nghe sạch hơn hẳn.', ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=80'], 74, 18, 2900],
  ['30000000-0000-0000-0000-000000000002', 'Studio', 'Một chain vocal mình hay dùng: noise cleanup nhẹ, compression chậm, de-esser vừa đủ, rồi delay thật thấp để giọng không bị khô.', [], 42, 7, 1800],
  ['30000000-0000-0000-0000-000000000003', 'Live', 'Show acoustic tối qua có một khoảnh khắc rất đẹp: cả phòng im khi bridge bắt đầu, rồi vỗ tay đúng nhịp ở câu cuối. Live music làm mình tin vào cộng đồng.', ['https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=80'], 91, 21, 4100],
  ['30000000-0000-0000-0000-000000000003', 'Music', 'Mình đang thử format hậu trường ngắn: 30 giây soundcheck, 1 ảnh setlist, 1 câu chuyện sau show. Vừa đủ để không làm timeline bị nặng.', [], 39, 5, 1500],
  ['30000000-0000-0000-0000-000000000004', 'Football', 'Buổi tập hôm nay chỉ tập một thứ: chạy cắt sau lưng trung vệ. Không bóng mới là lúc tiền đạo tạo ra bàn thắng.', ['https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1400&q=80'], 108, 24, 5200],
  ['30000000-0000-0000-0000-000000000004', 'Football', 'Một cú sút tốt bắt đầu trước khi nhận bóng: nhìn thủ môn, chỉnh thân người, chạm bước một đủ mềm. Phần còn lại là lặp lại hàng trăm lần.', [], 63, 10, 2600],
  ['30000000-0000-0000-0000-000000000005', 'Football', 'Điểm hay của trận tối qua không phải bàn thắng, mà là cách đội chủ nhà ép đối thủ chuyền ra biên rồi khóa đường trả ngược vào half-space.', ['https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1400&q=80'], 96, 31, 4700],
  ['30000000-0000-0000-0000-000000000005', 'Tactics', 'Nếu feed thể thao chỉ xếp theo like, phân tích sâu sẽ thua clip giật gân. Thuật toán tốt nên dành chỗ cho bài giải thích có ngữ cảnh.', [], 71, 16, 3300],
  ['30000000-0000-0000-0000-000000000006', 'Football', 'Thủ môn không phản xạ bằng tay trước, mà bằng vị trí. Đứng đúng góc thì cú cứu thua nhìn đơn giản hơn thực tế rất nhiều.', ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80'], 82, 13, 3600],
  ['30000000-0000-0000-0000-000000000006', 'Training', 'Drill phản xạ tốt nhất tuần này: 6 bóng liên tục, mỗi bóng đổi hướng bằng chạm nhỏ. Mệt nhưng đọc bóng nhanh hơn rõ.', [], 45, 6, 1900],
  ['30000000-0000-0000-0000-000000000007', 'Daily', 'Quán mở từ 6 giờ. Cà phê đầu tiên của ngày luôn có một thứ rất riêng: chưa ồn, chưa vội, chỉ có tiếng máy xay và vài người quen.', ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80'], 68, 8, 2500],
  ['30000000-0000-0000-0000-000000000007', 'Lifestyle', 'Mình thích những bài đăng đời thường vì chúng làm mạng xã hội bớt giống sân khấu. Không phải ngày nào cũng cần có thành tựu lớn.', [], 52, 4, 1700],
  ['30000000-0000-0000-0000-000000000008', 'Daily', 'Lịch làm việc hôm nay: 90 phút tập trung, 15 phút nghỉ, tắt thông báo đến trưa. Không hoành tráng, nhưng nó cứu cả ngày.', ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80'], 59, 11, 2300],
  ['30000000-0000-0000-0000-000000000008', 'Work', 'Một feed tốt nên có nhịp: bài mới để thấy app sống, bài chất lượng để đáng đọc, bài từ người nhỏ để còn khám phá.', [], 77, 20, 3900],
  ['30000000-0000-0000-0000-000000000009', 'Books', 'Gạch chân hôm nay: một ý tưởng tốt không cần ồn ào, nó chỉ cần quay lại đúng lúc mình cần. Đọc chậm hơn nhưng nhớ lâu hơn.', ['https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1400&q=80'], 61, 7, 2200],
  ['30000000-0000-0000-0000-000000000009', 'Learning', 'Mình đang thử ghi chú theo 3 dòng: ý chính, ví dụ đời thật, câu hỏi còn mở. Cách này hợp với timeline ngắn hơn là bài review dài.', [], 48, 5, 1600],
  ['30000000-0000-0000-0000-000000000010', 'Photography', 'Ánh sáng đẹp nhất buổi chiều nay nằm trên một bức tường cũ. Không cần filter nhiều, chỉ cần đứng đúng chỗ thêm vài phút.', ['https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80'], 85, 12, 3400],
  ['30000000-0000-0000-0000-000000000010', 'Photo', 'Ảnh đời thường hay ở chỗ nó không ép người xem phải ngạc nhiên. Nó chỉ giữ lại một khoảnh khắc đủ thật.', [], 57, 6, 2000]
];

const qualityPluginSpecs = [
  {
    uuid: '31000000-0000-0000-0000-000000000001',
    name: 'Quality Ranking Kit',
    category: 'Algorithm',
    version: '2.0.0',
    description: 'Compact high-signal ranking blocks for freshness, conversation quality, trust, media depth, saves, and low-effort filtering.',
    icon: 'quality',
    tags: ['quality', 'ranking', 'freshness', 'trust'],
    blocks: [
      { id: 'fresh_relevance', name: 'Fresh relevance', type: 'score', weight: 1.3, description: 'Boosts recent posts without burying strong older posts.', rules: ['score freshness using post.age_hours half_life 36', 'boost 8 when post.age_hours <= 6', 'penalty 3 when post.age_hours > 120'] },
      { id: 'conversation_depth', name: 'Conversation depth', type: 'score', weight: 1.2, description: 'Rewards replies, quotes, and meaningful discussion.', rules: ['score replies weight 1.4', 'score quotes weight 1.8', 'boost 6 when post.reply_count >= 4'] },
      { id: 'trusted_author', name: 'Trusted author', type: 'boost', weight: 1.0, description: 'Adds a small lift for verified and consistently healthy authors.', rules: ['boost 5 when author.is_verified == true', 'boost 4 when author.reputation >= 70', 'penalty 4 when author.report_rate > 0.08'] },
      { id: 'media_depth', name: 'Media depth', type: 'boost', weight: 0.9, description: 'Rewards original media, galleries, and watchable video.', rules: ['boost 6 when post.has_media == true', 'boost 4 when media.count >= 2', 'boost 5 when media.kind == "video"'] },
      { id: 'save_value', name: 'Save value', type: 'score', weight: 1.1, description: 'Detects posts people bookmark or return to.', rules: ['score bookmarks weight 2.2', 'boost 7 when post.bookmark_count >= 8', 'boost 3 when post.view_count >= 1000'] },
      { id: 'low_effort_guard', name: 'Low effort guard', type: 'filter', weight: 1.0, description: 'Reduces empty, duplicate, or clickbait-like posts.', rules: ['penalty 8 when post.word_count < 3', 'penalty 10 when post.duplicate_score > 0.85', 'penalty 12 when post.content contains "clickbait"'] },
      { id: 'balanced_popularity', name: 'Balanced popularity', type: 'score', weight: 1.0, description: 'Uses engagement while preventing pure like-count domination.', rules: ['score likes weight 0.6 cap 80', 'score reposts weight 1.4 cap 40', 'score replies weight 1.2 cap 60'] },
      { id: 'creator_momentum', name: 'Creator momentum', type: 'boost', weight: 0.8, description: 'Surfaces creators with a recent streak of good posts.', rules: ['boost 5 when author.quality_streak >= 3', 'boost 3 when author.new_follow_rate > 0.04', 'penalty 3 when author.post_frequency > 30'] }
    ]
  },
  {
    uuid: '31000000-0000-0000-0000-000000000002',
    name: 'Topic Persona Kit',
    category: 'Discovery',
    version: '2.0.0',
    description: 'Focused discovery blocks for music, football, daily life, books, photography, work, and mixed-interest home feeds.',
    icon: 'topic',
    tags: ['topic', 'music', 'football', 'lifestyle'],
    blocks: [
      { id: 'music_listener_match', name: 'Music listener match', type: 'topic', weight: 1.2, description: 'Finds songs, shows, studio notes, and artists.', rules: ['boost 8 when post.topic in ["Music", "Live", "Studio"]', 'boost 5 when post.content contains "demo", "setlist", "vocal"', 'penalty 4 when post.topic == "spam"'] },
      { id: 'football_tactics_match', name: 'Football tactics match', type: 'topic', weight: 1.2, description: 'Finds football analysis, training, and match context.', rules: ['boost 8 when post.topic in ["Football", "Tactics", "Training"]', 'boost 5 when post.content contains "pressing", "half-space", "striker"', 'boost 3 when author.category == "Football"'] },
      { id: 'daily_life_match', name: 'Daily life match', type: 'topic', weight: 0.9, description: 'Keeps calm personal updates in the feed.', rules: ['boost 6 when post.topic in ["Daily", "Lifestyle", "Work"]', 'boost 4 when post.content contains "morning", "routine", "coffee"', 'penalty 3 when post.promo_density > 0.3'] },
      { id: 'books_learning_match', name: 'Books and learning match', type: 'topic', weight: 0.9, description: 'Surfaces reading notes, study reflections, and learning posts.', rules: ['boost 7 when post.topic in ["Books", "Learning"]', 'boost 4 when post.content contains "note", "book", "question"', 'boost 3 when post.word_count >= 28'] },
      { id: 'photo_visual_match', name: 'Photo visual match', type: 'topic', weight: 0.9, description: 'Rewards everyday photography and visual storytelling.', rules: ['boost 7 when post.topic in ["Photography", "Photo"]', 'boost 5 when post.has_media == true', 'boost 3 when post.content contains "light", "street", "moment"'] },
      { id: 'local_context_match', name: 'Local context match', type: 'topic', weight: 0.8, description: 'Adds context for places and communities close to the user.', rules: ['boost 5 when post.location == viewer.location', 'boost 3 when author.location == viewer.location', 'boost 2 when post.topic == viewer.primary_topic'] },
      { id: 'new_voice_probe', name: 'New voice probe', type: 'explore', weight: 0.7, description: 'Leaves room for creators the viewer has not seen often.', rules: ['boost 5 when viewer.seen_author_count <= 1', 'boost 4 when author.followers < 5000', 'penalty 2 when author.report_rate > 0.04'] },
      { id: 'topic_blend_home', name: 'Topic blend home', type: 'mix', weight: 1.0, description: 'Balances the home feed across the user interests.', rules: ['limit topic Music to 35 percent', 'limit topic Football to 35 percent', 'reserve 20 percent for Daily and Learning'] }
    ]
  },
  {
    uuid: '31000000-0000-0000-0000-000000000003',
    name: 'Safety Diversity Kit',
    category: 'Moderation',
    version: '2.0.0',
    description: 'Safety and diversity blocks for anti-spam, duplicate reduction, author rotation, topic balance, and healthy exploration.',
    icon: 'safety',
    tags: ['safety', 'diversity', 'filtering', 'anti-spam'],
    blocks: [
      { id: 'spam_filter', name: 'Spam filter', type: 'filter', weight: 1.4, description: 'Filters scam, spam, and engagement bait signals.', rules: ['filter when post.content contains "scam", "airdrop", "free money"', 'penalty 15 when post.link_reputation < 35', 'penalty 10 when post.repeated_text == true'] },
      { id: 'nsfw_guard', name: 'NSFW guard', type: 'filter', weight: 1.2, description: 'Keeps unsafe posts out of default home ranking.', rules: ['filter when post.safety_label == "nsfw"', 'penalty 12 when post.safety_score < 60', 'penalty 8 when media.safety_score < 60'] },
      { id: 'author_diversity', name: 'Author diversity', type: 'diversity', weight: 1.2, description: 'Avoids one author taking over the feed.', rules: ['limit author to 2 posts per page', 'penalty 5 when author.last_seen_rank <= 3', 'boost 3 when author.not_seen_today == true'] },
      { id: 'topic_diversity', name: 'Topic diversity', type: 'diversity', weight: 1.0, description: 'Avoids topic repetition inside a single feed page.', rules: ['limit topic to 4 posts per page', 'boost 4 when topic.not_seen_recently == true', 'penalty 3 when topic.repetition_count >= 3'] },
      { id: 'duplicate_collapse', name: 'Duplicate collapse', type: 'filter', weight: 1.1, description: 'Reduces repeated posts and near-identical repost waves.', rules: ['filter when post.duplicate_score > 0.92', 'penalty 10 when post.url_seen_count > 8', 'penalty 6 when post.text_similarity > 0.82'] },
      { id: 'healthy_replies', name: 'Healthy replies', type: 'score', weight: 0.8, description: 'Rewards replies that indicate healthy conversation.', rules: ['boost 5 when reply.toxicity_avg < 0.2', 'boost 3 when reply.unique_authors >= 3', 'penalty 5 when reply.toxicity_avg > 0.55'] },
      { id: 'small_creator_fairness', name: 'Small creator fairness', type: 'diversity', weight: 0.8, description: 'Keeps smaller quality accounts discoverable.', rules: ['boost 5 when author.followers < 1000 and author.quality_score >= 70', 'reserve 15 percent for emerging creators', 'penalty 2 when author.post_frequency > 20'] },
      { id: 'rage_bait_guard', name: 'Rage bait guard', type: 'filter', weight: 1.0, description: 'Dampens posts optimized only for outrage.', rules: ['penalty 8 when post.sentiment == "rage"', 'penalty 6 when post.report_velocity > 0.06', 'boost 2 when post.has_context_link == true'] }
    ]
  }
];

function actorUrl(username, path = '') {
  return `https://${DOMAIN}/users/${username}${path}`;
}

function buildQualityBlocks(spec) {
  return spec.blocks.map((block) => ({
    id: block.id,
    name: block.name,
    label: block.name,
    type: block.type,
    group: spec.category,
    weight: block.weight,
    inputs: ['post', 'author', 'stats', 'viewer'],
    output: `${spec.icon}.${block.id}`,
    description: block.description,
    rules: block.rules
  }));
}

function buildQualityPluginCode(spec) {
  const blocks = spec.blocks.map((block) => {
    const rules = block.rules.map((rule) => `        ${rule}`).join('\n');
    return [
      `    block "${block.id}" {`,
      `        name "${block.name}"`,
      `        type "${block.type}"`,
      `        weight ${block.weight}`,
      `        description "${block.description}"`,
      rules,
      `        emit "${spec.icon}.${block.id}"`,
      '    }'
    ].join('\n');
  }).join('\n\n');

  return [
    `plugin "${spec.name}" {`,
    `    name "${spec.name}"`,
    `    version "${spec.version}"`,
    `    category "${spec.category}"`,
    `    description "${spec.description}"`,
    `    icon "${spec.icon}"`,
    `    tags ${JSON.stringify(spec.tags)}`,
    '',
    blocks,
    '}'
  ].join('\n');
}

function postDate(index) {
  const date = new Date();
  date.setHours(date.getHours() - index * 3);
  return date;
}

async function upsertUser(user, passwordHash) {
  return prisma.user.upsert({
    where: { uuid: user.uuid },
    create: {
      uuid: user.uuid,
      username: user.username,
      identityDomain: DOMAIN,
      actorUri: actorUrl(user.username),
      inboxUrl: actorUrl(user.username, '/inbox'),
      outboxUrl: actorUrl(user.username, '/outbox'),
      email: user.email,
      password: passwordHash,
      fullName: user.fullName,
      bio: user.bio,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      headline: user.headline,
      professionalCategory: user.professionalCategory,
      location: user.location,
      isVerified: true,
      emailVerified: true,
      status: 'ACTIVE',
      language: 'vn',
      deletedAt: null
    },
    update: {
      username: user.username,
      identityDomain: DOMAIN,
      actorUri: actorUrl(user.username),
      inboxUrl: actorUrl(user.username, '/inbox'),
      outboxUrl: actorUrl(user.username, '/outbox'),
      fullName: user.fullName,
      bio: user.bio,
      avatar: user.avatar,
      coverPhoto: user.coverPhoto,
      headline: user.headline,
      professionalCategory: user.professionalCategory,
      location: user.location,
      isVerified: true,
      emailVerified: true,
      status: 'ACTIVE',
      deletedAt: null
    }
  });
}

async function upsertPost(index, [userId, topic, content, media, likeCount, repostCount, viewCount]) {
  const uuid = `33000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`;
  const createdAt = postDate(index);

  await prisma.post.upsert({
    where: { uuid },
    create: {
      uuid,
      userId,
      type: 'POST',
      content,
      topic,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      trendingScore: likeCount * 1.2 + repostCount * 2 + viewCount / 120,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null
    },
    update: {
      userId,
      content,
      topic,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      trendingScore: likeCount * 1.2 + repostCount * 2 + viewCount / 120,
      createdAt,
      deletedAt: null
    }
  });

  await prisma.postStat.upsert({
    where: { postId: uuid },
    create: {
      postId: uuid,
      likeCount,
      repostCount,
      replyCount: Math.max(1, Math.floor(likeCount / 18)),
      quoteCount: Math.max(0, Math.floor(repostCount / 5)),
      bookmarkCount: Math.max(1, Math.floor(likeCount / 9)),
      viewCount
    },
    update: {
      likeCount,
      repostCount,
      replyCount: Math.max(1, Math.floor(likeCount / 18)),
      quoteCount: Math.max(0, Math.floor(repostCount / 5)),
      bookmarkCount: Math.max(1, Math.floor(likeCount / 9)),
      viewCount
    }
  });

  await prisma.postMedia.deleteMany({ where: { postId: uuid } });
  await Promise.all(
    media.map((url, order) =>
      prisma.postMedia.create({
        data: {
          postId: uuid,
          type: 'IMAGE',
          url,
          thumbnailUrl: url,
          mimeType: 'image/jpeg',
          width: 1400,
          height: 900,
          displayOrder: order
        }
      })
    )
  );
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const seedOwner = await upsertUser(owner, passwordHash);
  await Promise.all(demoUsers.map((user) => upsertUser(user, passwordHash)));

  await prisma.plugin.deleteMany({});

  for (const spec of qualityPluginSpecs) {
    const blocksMetadata = buildQualityBlocks(spec);
    await prisma.plugin.upsert({
      where: { uuid: spec.uuid },
      create: {
        uuid: spec.uuid,
        authorId: seedOwner.uuid,
        name: spec.name,
        description: spec.description,
        code: buildQualityPluginCode(spec),
        category: spec.category,
        isPublic: true,
        version: spec.version,
        blocksMetadata,
        tags: spec.tags,
        deletedAt: null
      },
      update: {
        authorId: seedOwner.uuid,
        name: spec.name,
        description: spec.description,
        code: buildQualityPluginCode(spec),
        category: spec.category,
        isPublic: true,
        version: spec.version,
        blocksMetadata,
        tags: spec.tags,
        deletedAt: null
      }
    });
  }

  const algorithmPipeline = [
    { id: 'builtin_freshness', config: { weight: 38, halfLifeHours: 36 } },
    { id: 'builtin_interactions', config: { weight: 22, likes: 1, reposts: 1.8, replies: 1.4 } },
    { id: '31000000-0000-0000-0000-000000000001:fresh_relevance', config: { weight: 1.3 } },
    { id: '31000000-0000-0000-0000-000000000001:conversation_depth', config: { weight: 1.2 } },
    { id: '31000000-0000-0000-0000-000000000002:topic_blend_home', config: { music: 35, football: 35 } },
    { id: '31000000-0000-0000-0000-000000000003:author_diversity', config: { limit_per_author: 2 } },
    { id: '31000000-0000-0000-0000-000000000003:spam_filter', config: { strictness: 'standard' } },
    { command: 'boost', config: { target: 'media', weight: 9 } },
    { command: 'boost', config: { target: 'topic:Music', weight: 7 } },
    { command: 'boost', config: { target: 'topic:Football', weight: 7 } },
    { command: 'filter_out', config: { criterion: 'nsfw' } },
    { id: 'builtin_diversify', config: { limit_per_author: 2, topicBalance: true } },
    { id: 'builtin_sort', config: { by: 'quality_score' } }
  ];

  const algorithmWeights = {
    freshness: 38,
    interactions: 22,
    authorTrust: 16,
    mediaDepth: 9,
    topicClarity: 10,
    diversity: 15,
    pluginPacks: qualityPluginSpecs.map((spec) => ({
      pluginId: spec.uuid,
      sourcePluginId: spec.uuid,
      localPluginId: spec.uuid,
      name: spec.name,
      blocksUsed: spec.blocks.length,
      priority: spec.icon === 'quality' ? 'high' : 'normal'
    })),
    pluginDependencies: qualityPluginSpecs.map((spec) => ({
      sourcePluginId: spec.uuid,
      localPluginId: spec.uuid,
      name: spec.name,
      version: spec.version
    }))
  };

  await prisma.userAlgorithm.upsert({
    where: { uuid: '32000000-0000-0000-0000-000000000001' },
    create: {
      uuid: '32000000-0000-0000-0000-000000000001',
      userId: seedOwner.uuid,
      name: 'Arteo Quality Discovery',
      shortDescription: 'Feed chất lượng dùng 3 plugin gọn và 24 block chọn lọc.',
      description: 'Thuật toán khám phá cân bằng bài mới, tương tác thật, chủ đề rõ, media chất lượng và đa dạng tác giả.',
      weights: algorithmWeights,
      pipeline: algorithmPipeline,
      isPublic: true,
      isActive: false,
      isPinned: true,
      pinOrder: 1,
      version: '1.0.0',
      tags: ['quality', 'music', 'football', 'daily', 'discovery'],
      changelog: [{ version: '2.0.0', note: 'Rebuilt with 3 focused plugin kits and 24 curated blocks.' }],
      deletedAt: null
    },
    update: {
      userId: seedOwner.uuid,
      name: 'Arteo Quality Discovery',
      shortDescription: 'Feed chất lượng dùng 3 plugin gọn và 24 block chọn lọc.',
      description: 'Thuật toán khám phá cân bằng bài mới, tương tác thật, chủ đề rõ, media chất lượng và đa dạng tác giả.',
      weights: algorithmWeights,
      pipeline: algorithmPipeline,
      isPublic: true,
      isPinned: true,
      pinOrder: 1,
      version: '1.0.0',
      tags: ['quality', 'music', 'football', 'daily', 'discovery'],
      changelog: [{ version: '2.0.0', note: 'Rebuilt with 3 focused plugin kits and 24 curated blocks.' }],
      deletedAt: null
    }
  });

  for (let index = 0; index < posts.length; index += 1) {
    await upsertPost(index, posts[index]);
  }

  const currentUsers = await prisma.user.findMany({
    where: {
      deletedAt: null,
      uuid: { notIn: demoUsers.map((user) => user.uuid) }
    },
    select: { uuid: true, username: true }
  });

  const followerIds = new Set(currentUsers.map((user) => user.uuid));
  followerIds.add(seedOwner.uuid);

  for (const followerId of followerIds) {
    for (const user of demoUsers) {
      if (followerId === user.uuid) continue;
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId,
            followingId: user.uuid
          }
        },
        create: {
          followerId,
          followingId: user.uuid
        },
        update: {}
      });
    }
  }

  for (const user of demoUsers) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: user.uuid,
          followingId: seedOwner.uuid
        }
      },
      create: {
        followerId: user.uuid,
        followingId: seedOwner.uuid
      },
      update: {}
    });
  }

  const currentNonOwnerUsers = currentUsers.filter((user) => user.uuid !== seedOwner.uuid);
  for (const user of currentNonOwnerUsers) {
    for (const spec of qualityPluginSpecs) {
      const sourceCode = buildQualityPluginCode(spec);
      const existingPlugin = await prisma.plugin.findFirst({
        where: {
          authorId: user.uuid,
          name: spec.name,
          deletedAt: null
        }
      });

      if (!existingPlugin) {
        await prisma.plugin.create({
          data: {
            authorId: user.uuid,
            name: spec.name,
            description: spec.description,
            code: sourceCode,
            category: spec.category,
            isPublic: false,
            version: spec.version,
            blocksMetadata: buildQualityBlocks(spec),
            tags: spec.tags,
            deletedAt: null
          }
        });
      }
    }

    await prisma.userAlgorithm.updateMany({
      where: {
        userId: user.uuid,
        deletedAt: null,
        OR: [
          { name: 'Arteo Quality Discovery' },
          { installedFromId: '32000000-0000-0000-0000-000000000001' }
        ],
        NOT: { uuid: `32000000-0000-0000-0001-${user.uuid.slice(-12)}` }
      },
      data: {
        isActive: false,
        isPinned: false
      }
    });

    await prisma.userAlgorithm.upsert({
      where: { uuid: `32000000-0000-0000-0001-${user.uuid.slice(-12)}` },
      create: {
        uuid: `32000000-0000-0000-0001-${user.uuid.slice(-12)}`,
        userId: user.uuid,
        name: 'Arteo Quality Discovery',
        shortDescription: 'Feed chất lượng dùng 3 plugin gọn và 24 block chọn lọc.',
        description: 'Bản cài đặt cá nhân của thuật toán Arteo Quality Discovery.',
        weights: algorithmWeights,
        pipeline: algorithmPipeline,
        isPublic: false,
        isActive: true,
        isPinned: true,
        pinOrder: 1,
        version: '1.0.0',
        installedFromId: '32000000-0000-0000-0000-000000000001',
        tags: ['quality', 'music', 'football', 'daily', 'discovery'],
        deletedAt: null
      },
      update: {
        weights: algorithmWeights,
        pipeline: algorithmPipeline,
        isActive: true,
        isPinned: true,
        pinOrder: 1,
        deletedAt: null
      }
    });
  }

  console.log('Seed complete:');
  console.log('- Deleted old plugins');
  console.log('- 3 public quality plugins with 8 curated blocks each');
  console.log('- Installed those plugins for existing non-system users');
  console.log('- 1 public quality algorithm using 24 curated blocks');
  console.log('- 10 themed users and 20 posts');
  console.log(`- Demo password: ${PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
