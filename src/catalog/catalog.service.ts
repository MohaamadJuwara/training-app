import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(title?: string) {
    return this.prisma.catalog.findMany({
      where: title ? { title: { contains: title, mode: 'insensitive' } } : undefined,
      orderBy: { publishedAt: 'desc' },
      include: {
        course: { select: { author: { select: { email: true } } } },
      },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.catalog.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, author: { select: { email: true } } } },
      },
    });

    if (!item) throw new NotFoundException(`Catalog item #${id} not found`);

    return item;
  }
}
