import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Team extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop({
    type: [
      {
        _id: false,
        userId: { type: Types.ObjectId, ref: 'User' },
        role: {
          type: String,
          enum: ['admin', 'manager', 'member'],
          default: 'member',
        },
      },
    ],
    default: [],
  })
  members: {
    userId: Types.ObjectId;
    role: 'admin' | 'manager' | 'member';
  }[];
}

export const TeamSchema = SchemaFactory.createForClass(Team);
