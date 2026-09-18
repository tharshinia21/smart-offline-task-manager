import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest()
    const h = req.headers.authorization
    if (!h?.startsWith('Bearer ')) throw new UnauthorizedException('Missing token')
    try {
      const payload = this.jwt.verify(h.slice(7))
      req.user = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
