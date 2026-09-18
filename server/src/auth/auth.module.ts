import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from '../schemas/user.schema'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
