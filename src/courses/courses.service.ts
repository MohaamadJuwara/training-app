import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCourseDto, authorId: number) {
    return this.prisma.course.create({
      data: { ...dto, authorId },
      include: { author: { select: { email: true, role: true } } },
    });
  }

  findAll(authorId: number) {
    return this.prisma.course.findMany({
      where: { authorId },
      orderBy: { updatedAt: 'desc' },
      include: { author: { select: { email: true, role: true } } },
    });
  }

  async findOne(id: number, authorId: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { author: { select: { email: true, role: true } } },
    });

    if (!course) throw new NotFoundException(`Course #${id} not found`);
    if (course.authorId !== authorId) throw new ForbiddenException('Not your course');

    return course;
  }

  async update(id: number, dto: UpdateCourseDto, authorId: number) {
    await this.findOne(id, authorId);
    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: { author: { select: { email: true, role: true } } },
    });
  }

  async remove(id: number, authorId: number) {
    await this.findOne(id, authorId);
    return this.prisma.course.delete({ where: { id } });
  }
}
