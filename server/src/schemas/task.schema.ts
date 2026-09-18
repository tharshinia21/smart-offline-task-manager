import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type TaskDocument = HydratedDocument<Task>

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, index: true })
  userId: string // User ObjectId as string

  @Prop({ required: true })
  title: string

  // YYYY-MM-DD
  @Prop({ required: true })
  dueDate: string

  // HH:mm
  @Prop({ required: true })
  dueTime: string

  @Prop()
  link?: string

  @Prop()
  linkName?: string

  @Prop({ enum: ['not_started','in_progress','completed','cancelled'], default: 'not_started' })
  status: string

  @Prop()
  completedAt?: number

  @Prop({ default: 1 })
  version: number

  @Prop()
  deletedAt?: number

  @Prop()
  snoozedUntil?: number

  @Prop({ default: () => new Types.ObjectId().toString() })
  clientId?: string
}

export const TaskSchema = SchemaFactory.createForClass(Task)
TaskSchema.index({ userId: 1, deletedAt: 1, status: 1, dueDate: 1 })
TaskSchema.index({ userId: 1, updatedAt: 1 })
