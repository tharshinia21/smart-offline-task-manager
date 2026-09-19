import { Module, OnModuleInit } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Task, TaskSchema } from '../schemas/task.schema'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { NotificationsModule } from '../notifications/notifications.module'
import { NotificationsService } from '../notifications/notifications.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), NotificationsModule],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule implements OnModuleInit {
  constructor(private tasks: TasksService, private notifs: NotificationsService){}
  onModuleInit(){ this.tasks.setNotificationsService(this.notifs) }
}
