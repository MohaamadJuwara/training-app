import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [CacheModule.register({ ttl: 60000, max: 100 })],
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
