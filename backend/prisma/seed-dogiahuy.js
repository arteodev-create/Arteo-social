const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('DoGiaHuy', 10);

  const user = await prisma.user.upsert({
    where: { username: 'DoGiaHuy' },
    update: {
      email: 'dogiahuy@arteo.local',
      password: passwordHash,
      fullName: 'Do Gia Huy',
      bio: 'Arteo creator account.',
      emailVerified: true,
      status: 'ACTIVE',
      role: 'admin',
      isAdmin: true,
      isVerified: true,
      language: 'vi',
    },
    create: {
      username: 'DoGiaHuy',
      email: 'dogiahuy@arteo.local',
      password: passwordHash,
      fullName: 'Do Gia Huy',
      bio: 'Arteo creator account.',
      emailVerified: true,
      status: 'ACTIVE',
      role: 'admin',
      isAdmin: true,
      isVerified: true,
      language: 'vi',
    },
    select: {
      uuid: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      isAdmin: true,
      isVerified: true,
      status: true,
    },
  });

  console.log('Seeded account:');
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
