import { Module, OnModuleInit } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Task, TaskSchema } from '../schemas/task.schema'
import { SyncService } from './sync.service'
import { SyncController } from './sync.controller'
import { NotificationsModule } from '../notifications/notifications.module'
import { NotificationsService } from '../notifications/notifications.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]), NotificationsModule],
  providers: [SyncService],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule implements OnModuleInit {
  constructor(private sync: SyncService, private notifs: NotificationsService){}
  onModuleInit(){ this.sync.setNotificationsService(this.notifs) }
}
