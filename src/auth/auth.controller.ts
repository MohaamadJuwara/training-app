import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulated OAuth login',
    description:
      'Pass any email + provider. On first call the user is registered with the given role. Returns a JWT.',
  })
  @ApiResponse({ status: 200, description: 'Login successful — returns JWT access_token' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
