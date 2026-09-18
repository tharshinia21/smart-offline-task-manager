import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtGuard } from '../common/jwt.guard'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: any) {
    return this.auth.register(dto)
  }

  @Post('login')
  login(@Body() dto: any) {
    return this.auth.login(dto)
  }

  @Post('refresh')
  @UseGuards(JwtGuard)
  refresh(@Req() req: any) {
    return this.auth.refresh(req.user)
  }
}
