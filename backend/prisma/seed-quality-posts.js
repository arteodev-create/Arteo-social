const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const QUALITY_POSTS = [
  {
    uuid: '41000000-0000-0000-0000-000000000001',
    username: 'annguyen01',
    topic: 'Technology',
    content: 'Vừa thử đăng bài trên Arteo. Cảm giác đầu tiên khá ổn: viết, đăng, vào profile thấy ngay. Chỉ cần interaction đừng lệch trạng thái là có thể demo được.'
  },
  {
    uuid: '41000000-0000-0000-0000-000000000002',
    username: 'baobui02',
    topic: 'Design',
    content: [
      'Một profile tốt không cần quá nhiều thứ.',
      '',
      'Tên phải rõ. Handle phải đọc được. Tích xanh không được bị che. Bio có hoặc không cũng phải nhìn gọn. Và tab bài viết phải trả lời ngay: người này đã đăng gì?',
      '',
      'Mấy thứ nhỏ này quyết định người dùng có tin app hay không.'
    ].join('\n')
  },
  {
    uuid: '41000000-0000-0000-0000-000000000003',
    username: 'chidaily03',
    topic: 'Startups',
    content: [
      'Checklist trước launch của mình:',
      '',
      '- Feed mở nhanh',
      '- Đăng bài xong profile phải thấy ngay',
      '- Like/save/repost bấm lại không bị sai số',
      '- Tính năng nào chưa chắc thì ghi sắp mở',
      '- Đừng để user thấy trang rỗng mà không hiểu vì sao',
      '',
      'Nghe đơn giản nhưng thật ra đây là toàn bộ cảm giác sản phẩm.'
    ].join('\n')
  },
  {
    uuid: '41000000-0000-0000-0000-000000000004',
    username: 'duypham04',
    topic: 'AI',
    content: [
      'Mình không thích feed AI mà cứ giả vờ thông minh.',
      '',
      'Nếu thuật toán chỉ đẩy bài nhiều like thì sớm muộn timeline cũng thành một cái loa. Bài mới không có cơ hội. Người viết nhỏ biến mất. Chủ đề nào đang nóng thì nuốt hết phần còn lại.',
      '',
      'Một feed dễ chịu nên có vài lớp:',
      '',
      '1. Bài mới để app có nhịp sống.',
      '2. Người đáng tin để feed không loạn.',
      '3. Chủ đề đa dạng để không bị kẹt trong một bong bóng.',
      '4. Chặn trùng lặp để không thấy một kiểu post lặp lại mười lần.',
      '',
      'AI trong social app nên giống biên tập viên tốt: biết chọn, nhưng không lấn át.'
    ].join('\n')
  },
  {
    uuid: '41000000-0000-0000-0000-000000000005',
    username: 'giangstudio05',
    topic: 'Education',
    content: 'Một app chậm không chỉ là chậm vì thời gian tải. Nó chậm khi người dùng không biết app đang làm gì. Loading rõ ràng đôi khi cứu được cả trải nghiệm.'
  },
  {
    uuid: '41000000-0000-0000-0000-000000000006',
    username: 'haopixel06',
    topic: 'Finance',
    content: [
      'Trong các cộng đồng tài chính, mình muốn thấy ít “kèo nóng” hơn và nhiều ngữ cảnh hơn.',
      '',
      'Một post tốt nên có thời gian, giả định, rủi ro, và lý do người viết nghĩ như vậy. Không cần lúc nào cũng dài, nhưng phải có trách nhiệm.',
      '',
      'Nhanh thì tốt. Nhanh mà có căn cứ mới đáng đọc.'
    ].join('\n')
  },
  {
    uuid: '41000000-0000-0000-0000-000000000007',
    username: 'khanhdang07',
    topic: 'Gaming',
    content: [
      'Có ai ở đây chơi game chỉ để đọc patch note không?',
      '',
      'Mình thì có. Patch note hay giống như nhật ký phát triển vậy. Nó cho thấy team đang nghĩ gì, sửa gì, bỏ gì, và đôi khi cả việc họ đang hoảng ở đâu.',
      '',
      'Nếu Arteo làm tốt phần post dài + media + quote, cộng đồng game dùng được nhiều thứ: clip highlight, build guide, báo bug, tuyển team, giải đấu nhỏ.'
    ].join('\n')
  },
  {
    uuid: '41000000-0000-0000-0000-000000000008',
    username: 'linhcreative08',
    topic: 'Photography',
    content: 'Ảnh đẹp mà preview bị crop bừa là mất một nửa cảm xúc. Social app nào làm media tử tế là mình ở lại lâu hơn.'
  },
  {
    uuid: '41000000-0000-0000-0000-000000000009',
    username: 'maile09',
    topic: 'Culture',
    content: [
      'Mình muốn một feed văn hóa có nhiều thứ đời thường hơn:',
      '',
      'Một quán nhỏ mới mở. Một playlist nghe lúc đi xe. Một bộ phim cũ tự nhiên được nhắc lại. Một triển lãm cuối tuần. Một câu chuyện địa phương không cần viral nhưng vẫn đáng lưu.',
      '',
      'Không phải mọi thứ đều cần thành trend. Có những bài chỉ cần đúng người đọc được là đủ.'
    ].join('\n')
  },
  {
    uuid: '41000000-0000-0000-0000-000000000010',
    username: 'minhphan10',
    topic: 'Productivity',
    content: [
      'Arteo Library nên giữ rất đơn giản ở bản đầu:',
      '',
      'Install để dùng.',
      'Download để mang đi.',
      'Settings để chỉnh.',
      'Delete khi không cần nữa.',
      '',
      'Các tính năng còn lại cứ để “sắp mở”. Người dùng không ghét app vì ít nút. Họ ghét khi nút bấm vào không ra gì.'
    ].join('\n')
  }
];

const previousGenericPostIds = () => Array.from(
  { length: 300 },
  (_, index) => `40000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`
);

const previousQualityPostIds = () => Array.from(
  { length: QUALITY_POSTS.length },
  (_, index) => `41000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`
);

async function deletePreviousSeedPosts() {
  const result = await prisma.post.deleteMany({
    where: {
      uuid: { in: [...previousGenericPostIds(), ...previousQualityPostIds()] }
    }
  });
  return result.count;
}

async function upsertQualityPosts(count) {
  const posts = QUALITY_POSTS.slice(0, count);

  for (let index = 0; index < posts.length; index += 1) {
    const item = posts[index];
    const user = await prisma.user.findUnique({ where: { username: item.username } });
    if (!user) throw new Error(`Seed user not found: ${item.username}`);

    const topic = await prisma.topic.findFirst({ where: { name: item.topic } });
    await prisma.post.upsert({
      where: { uuid: item.uuid },
      update: {
        userId: user.uuid,
        content: item.content,
        topic: item.topic,
        topicId: topic?.uuid,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        deletedAt: null
      },
      create: {
        uuid: item.uuid,
        userId: user.uuid,
        content: item.content,
        topic: item.topic,
        topicId: topic?.uuid,
        status: 'PUBLISHED',
        visibility: 'PUBLIC',
        createdAt: new Date(Date.now() - index * 18 * 60 * 1000),
        stats: {
          create: {
            likeCount: 24 + index * 7,
            repostCount: 4 + index * 2,
            quoteCount: 1 + (index % 4),
            replyCount: 3 + index,
            bookmarkCount: 8 + index * 3,
            viewCount: 700 + index * 230
          }
        }
      }
    });
  }

  return posts;
}

async function main() {
  const countArg = process.argv.find(arg => arg.startsWith('--count='));
  const count = Math.min(Math.max(Number(countArg?.split('=')[1] || 1), 1), QUALITY_POSTS.length);

  const deletedSeedPosts = await deletePreviousSeedPosts();
  const posts = await upsertQualityPosts(count);
  console.log(JSON.stringify({
    deletedSeedPosts,
    qualityPostsVisible: posts.length,
    firstPost: {
      uuid: posts[0].uuid,
      username: posts[0].username,
      topic: posts[0].topic,
      preview: posts[0].content.slice(0, 160)
    }
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
