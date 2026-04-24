const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create sample users
    const user1 = await prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
        posts: {
          create: {
            title: 'First Post',
            content: 'Welcome to the training app!',
            published: true,
          },
        },
      },
    });

    const user2 = await prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob',
        posts: {
          create: {
            title: "Bob's First Post",
            content: 'Another great post',
            published: true,
          },
        },
      },
    });

    console.log('Seed completed successfully');
    console.log({ user1, user2 });
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
