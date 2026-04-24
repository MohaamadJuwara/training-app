import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { QueryCatalogDto } from './dto/query-catalog.dto';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('catalog-all')
  @CacheTTL(60000)
  @ApiOperation({
    summary: 'Browse all published courses (public)',
    description: 'Response is cached for 60 seconds. Filter by title with ?title=',
  })
  @ApiQuery({ name: 'title', required: false, description: 'Filter by title' })
  @ApiResponse({ status: 200, description: 'List of published catalog entries' })
  findAll(@Query() query: QueryCatalogDto) {
    return this.catalogService.findAll(query.title);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific published course (public)' })
  @ApiResponse({ status: 200, description: 'Catalog entry' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.findOne(id);
  }
}
