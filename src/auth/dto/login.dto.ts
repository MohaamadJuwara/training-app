import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ example: 'trainer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'google', description: 'OAuth provider (google | mock)' })
  @IsString()
  provider: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.TRAINEE,
    description: 'Role assigned on first registration. Ignored for existing users.',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
