import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@example.com' },
    update: {},
    create: { email: 'trainer@example.com', role: Role.TRAINER },
  });

  const trainee = await prisma.user.upsert({
    where: { email: 'trainee@example.com' },
    update: {},
    create: { email: 'trainee@example.com', role: Role.TRAINEE },
  });

  await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Introduction to Cycling',
      description: 'A beginner guide to road cycling',
      content: 'This course covers bike setup, safety gear, basic techniques, and your first training rides.',
      authorId: trainer.id,
    },
  });

  console.log('Seed complete:', { trainer, trainee });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
