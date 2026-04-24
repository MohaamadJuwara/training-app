import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublishService {
  constructor(private readonly prisma: PrismaService) {}

  async publish(courseId: number, authorId: number) {
    return this.prisma.$transaction(async (tx) => {
      const course = await tx.course.findUnique({ where: { id: courseId } });

      if (!course) {
        throw new NotFoundException(`Course #${courseId} not found`);
      }

      if (course.authorId !== authorId) {
        throw new ForbiddenException('You are not the author of this course');
      }

      if (!course.title?.trim() || !course.content?.trim()) {
        throw new BadRequestException(
          'Cannot publish: title and content must not be empty',
        );
      }

      const latest = await tx.catalog.findFirst({
        where: { courseId },
        orderBy: { version: 'desc' },
      });

      const nextVersion = latest ? latest.version + 1 : 1;

      return tx.catalog.create({
        data: {
          title: course.title,
          description: course.description,
          content: course.content,
          courseId: course.id,
          version: nextVersion,
          publishedAt: new Date(),
        },
      });
    });
  }
}
