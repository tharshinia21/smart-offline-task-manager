import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from '../schemas/user.schema'
import { JwtService } from '@nestjs/jwt'
import * as argon2 from 'argon2'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
})
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwt: JwtService) {}

  async register(dto: any) {
    const data = registerSchema.parse(dto)
    const exists = await this.userModel.findOne({ email: data.email.toLowerCase() })
    if (exists) throw new ConflictException('Email already registered')
    const hash = await argon2.hash(data.password)
    const user = await this.userModel.create({ name: data.name, email: data.email.toLowerCase(), passwordHash: hash })
    const token = this.jwt.sign({ sub: user._id.toString(), email: user.email, name: user.name })
    return { user: { id: user._id, name: user.name, email: user.email }, access_token: token }
  }

  async login(dto: any) {
    const data = loginSchema.parse(dto)
    const user = await this.userModel.findOne({ email: data.email.toLowerCase() })
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const ok = await argon2.verify(user.passwordHash, data.password)
    if (!ok) throw new UnauthorizedException('Invalid credentials')
    const token = this.jwt.sign({ sub: user._id.toString(), email: user.email, name: user.name })
    return { user: { id: user._id, name: user.name, email: user.email }, access_token: token }
  }

  async refresh(user: any) {
    const dbUser = await this.userModel.findById(user.sub)
    if (!dbUser) throw new UnauthorizedException('User not found')
    const token = this.jwt.sign({ sub: dbUser._id.toString(), email: dbUser.email, name: dbUser.name })
    return { access_token: token }
  }
}
