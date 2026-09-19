import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../common/jwt.guard'
import { NotificationsService } from './notifications.service'

@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get('vapid-public-key')
  getVapidKey() {
    return { publicKey: this.svc.getVapidPublicKey() }
  }

  @Post('subscribe')
  async subscribe(@Req() req:any, @Body() body:any) {
    const sub = body.subscription || body
    return this.svc.subscribe(req.user.sub, sub, body.deviceName, body.deviceType)
  }

  @Delete('subscribe')
  async unsubscribe(@Req() req:any, @Body() body:any) {
    const endpoint = body?.endpoint || body?.subscription?.endpoint
    return this.svc.unsubscribe(req.user.sub, endpoint)
  }

  @Post('test/:taskId')
  async testPush(@Req() req:any, @Param('taskId') taskId:string) {
    await (this.svc as any).sendPushForTask(taskId, req.user.sub)
    return { sent: true, taskId }
  }
}
