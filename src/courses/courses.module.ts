import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PublishModule } from '../publish/publish.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

@Module({
  imports: [AuthModule, PublishModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
