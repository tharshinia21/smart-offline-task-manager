import 'dotenv/config';
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from './auth/auth.module'
import { TasksModule } from './tasks/tasks.module'
import { SyncModule } from './sync/sync.module'

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-tasks'),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev_secret_change_me',
      signOptions: { expiresIn: process.env.JWT_EXPIRES || '7d' },
    }),
    AuthModule,
    TasksModule,
    SyncModule,
  ],
})
export class AppModule {}
