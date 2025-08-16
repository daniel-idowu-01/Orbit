import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('profile')
  async getProfile(@GetUser() user: any) {
    return user;
  }

  @Get('search/:query')
  async searchUsers(@Param('query') query: string) {
    return this.userService.searchUsers(query);
  }
}
