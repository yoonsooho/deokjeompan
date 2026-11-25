import { Body, Controller, Get, Headers, HttpCode, Post } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { BadgesService } from './badges.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly accounts: AccountsService, private readonly badges: BadgesService) {}

  @Post('register')
  register(@Body() value: unknown) {
    return this.accounts.register(value);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() value: unknown) {
    return this.accounts.login(value);
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Headers('authorization') authorization?: string) {
    this.accounts.logout(authorization);
  }

  @Get('me')
  me(@Headers('authorization') authorization?: string) {
    return this.accounts.requireAccount(authorization);
  }

  @Get('badges')
  myBadges(@Headers('authorization') authorization?: string) {
    return this.badges.list(this.accounts.requireAccount(authorization).id);
  }
}
