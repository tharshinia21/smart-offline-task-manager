import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../common/jwt.guard'
import { SyncService } from './sync.service'

@UseGuards(JwtGuard)
@Controller('sync')
export class SyncController {
  constructor(private sync: SyncService) {}

  @Post('push')
  push(@Req() req: any, @Body() body: any) {
    return this.sync.push(req.user.sub, body.changes || [])
  }

  @Get('pull')
  pull(@Req() req: any, @Query('since') since?: string) {
    return this.sync.pull(req.user.sub, since ? Number(since) : undefined)
  }
}
