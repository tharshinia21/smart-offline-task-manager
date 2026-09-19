import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type DeviceDocument = HydratedDocument<Device>

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, index: true })
  userId: string

  @Prop()
  deviceName: string

  @Prop()
  deviceType: string

  @Prop({ type: Object })
  pushSubscription?: {
    endpoint: string
    expirationTime?: number | null
    keys: { p256dh: string; auth: string }
  }

  @Prop()
  lastSyncAt?: Date
}

export const DeviceSchema = SchemaFactory.createForClass(Device)
