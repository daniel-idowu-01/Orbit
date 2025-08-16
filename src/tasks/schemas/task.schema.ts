import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' })
  status: string;

  @Prop({ type: Date })
  dueDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigneeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
