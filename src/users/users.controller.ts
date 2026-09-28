import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import type { RequestUser } from '../common/interfaces/request-user.interface.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the currently authenticated user's profile" })
  @ApiOkResponse({
    description: 'Current user profile extracted from the access token',
  })
  getMe(@CurrentUser() user: RequestUser): RequestUser {
    return user;
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'List all users',
    description: 'Admin only',
  })
  @ApiOkResponse({ type: User, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Access token missing or invalid' })
  getUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a single user', description: 'Admin only' })
  @ApiOkResponse({ type: User })
  @ApiNotFoundResponse({ description: 'User not found' })
  getUser(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Change a user's role", description: 'Admin only' })
  @ApiOkResponse({ type: User })
  changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<User> {
    return this.usersService.setRole(id, dto.role);
  }
}