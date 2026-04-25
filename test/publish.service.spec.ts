import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { PublishService } from '../src/publish/publish.service';

describe('PublishService', () => {
  let service: PublishService;

  const mockCourse = {
    id: 1,
    title: 'Introduction to Cycling',
    description: 'A beginner guide',
    content: 'Week 1: Base fitness. Week 2: Intervals.',
    authorId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCatalogEntry = {
    id: 1,
    title: mockCourse.title,
    description: mockCourse.description,
    content: mockCourse.content,
    courseId: mockCourse.id,
    version: 1,
    publishedAt: new Date(),
  };

  const buildTxMock = (overrides: Partial<{
    course: any;
    latestCatalog: any;
    createdCatalog: any;
  }> = {}) => ({
    course: {
      findUnique: jest.fn().mockResolvedValue('course' in overrides ? overrides.course : mockCourse),
    },
    catalog: {
      findFirst: jest.fn().mockResolvedValue(overrides.latestCatalog ?? null),
      create: jest.fn().mockResolvedValue(overrides.createdCatalog ?? mockCatalogEntry),
    },
  });

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublishService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PublishService>(PublishService);
    jest.clearAllMocks();
  });

  describe('publish()', () => {
    it('creates a catalog entry (version 1) when course has never been published', async () => {
      const tx = buildTxMock();
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      const result = await service.publish(1, 1);

      expect(tx.course.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(tx.catalog.findFirst).toHaveBeenCalledWith({
        where: { courseId: 1 },
        orderBy: { version: 'desc' },
      });
      expect(tx.catalog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: mockCourse.title,
            content: mockCourse.content,
            courseId: mockCourse.id,
            version: 1,
          }),
        }),
      );
      expect(result).toEqual(mockCatalogEntry);
    });

    it('increments version on re-publish', async () => {
      const existingEntry = { ...mockCatalogEntry, version: 3 };
      const tx = buildTxMock({ latestCatalog: existingEntry });
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await service.publish(1, 1);

      expect(tx.catalog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: 4 }),
        }),
      );
    });

    it('copies title, description and content from the draft snapshot', async () => {
      const tx = buildTxMock();
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await service.publish(1, 1);

      expect(tx.catalog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: mockCourse.title,
            description: mockCourse.description,
            content: mockCourse.content,
          }),
        }),
      );
    });

    it('throws NotFoundException when course does not exist', async () => {
      const tx = buildTxMock({ course: null });
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await expect(service.publish(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when caller is not the author', async () => {
      const tx = buildTxMock({ course: { ...mockCourse, authorId: 99 } });
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await expect(service.publish(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when title is empty', async () => {
      const tx = buildTxMock({ course: { ...mockCourse, title: '' } });
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await expect(service.publish(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when title is only whitespace', async () => {
      const tx = buildTxMock({ course: { ...mockCourse, title: '   ' } });
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await expect(service.publish(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when content is empty', async () => {
      const tx = buildTxMock({ course: { ...mockCourse, content: '' } });
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await expect(service.publish(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when content is null', async () => {
      const tx = buildTxMock({ course: { ...mockCourse, content: null } });
      mockPrismaService.$transaction.mockImplementation((fn) => fn(tx));

      await expect(service.publish(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
