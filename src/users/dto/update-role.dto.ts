import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum.js';

export class UpdateRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'New role to assign to the user',
  })
  @IsEnum(Role)
  role: Role;
}