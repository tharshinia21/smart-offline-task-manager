import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { JwtGuard } from '../common/jwt.guard'
import { TasksService } from './tasks.service'

@UseGuards(JwtGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  list(@Req() req: any) { return this.tasks.list(req.user.sub) }

  @Post()
  create(@Req() req: any, @Body() dto: any) { return this.tasks.create(req.user.sub, dto) }

  @Get(':id')
  get(@Req() req: any, @Param('id') id: string) { return this.tasks.get(req.user.sub, id) }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) { return this.tasks.update(req.user.sub, id, dto) }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) { return this.tasks.remove(req.user.sub, id) }

  @Post(':id/complete')
  complete(@Req() req: any, @Param('id') id: string) { return this.tasks.complete(req.user.sub, id) }

  @Post(':id/start')
  start(@Req() req: any, @Param('id') id: string) { return this.tasks.start(req.user.sub, id) }

  @Post(':id/snooze')
  snooze(@Req() req: any, @Param('id') id: string, @Body() b: any) { return this.tasks.snooze(req.user.sub, id, Number(b.minutes || b.mins || 30)) }

  @Post(':id/reschedule')
  reschedule(@Req() req: any, @Param('id') id: string, @Body() b: any) { return this.tasks.reschedule(req.user.sub, id, b.dueDate, b.dueTime) }
}
