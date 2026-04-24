import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PublishService } from '../publish/publish.service';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('courses')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TRAINER')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly publishService: PublishService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course draft (TRAINER only)' })
  @ApiResponse({ status: 201, description: 'Course draft created' })
  @ApiResponse({ status: 403, description: 'Forbidden — TRAINER role required' })
  create(@Body() dto: CreateCourseDto, @Request() req) {
    return this.coursesService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "List all your course drafts (TRAINER only)" })
  @ApiResponse({ status: 200, description: 'List of drafts authored by the current trainer' })
  @ApiResponse({ status: 403, description: 'Forbidden — TRAINER role required' })
  findAll(@Request() req) {
    return this.coursesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific course draft (TRAINER only)' })
  @ApiResponse({ status: 200, description: 'Course draft' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.coursesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a course draft (TRAINER only)' })
  @ApiResponse({ status: 200, description: 'Updated course draft' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.coursesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course draft (TRAINER only)' })
  @ApiResponse({ status: 204, description: 'Course deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.coursesService.remove(id, req.user.id);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Publish a course draft to the Catalog (TRAINER only)',
    description:
      'Snapshots the current draft into the Catalog. Editing the draft later will NOT change the published version until you publish again. Each publish increments the catalog version.',
  })
  @ApiResponse({ status: 201, description: 'Course published — catalog entry returned' })
  @ApiResponse({ status: 400, description: 'Cannot publish — title or content is empty' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  publish(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.publishService.publish(id, req.user.id);
  }
}
