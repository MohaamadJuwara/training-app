import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryCatalogDto {
  @ApiPropertyOptional({
    description: 'Filter published courses by title (case-insensitive contains)',
    example: 'cycling',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
