import { Team } from './schemas/team.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  async createTeam(name: string, ownerId: string) {
    return this.teamModel.create({
      name,
      owner: new Types.ObjectId(ownerId),
      members: [{ user: ownerId, role: 'admin' }],
    });
  }

  async addMember(teamId: string, newMemberId: string, adminId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const findMember = (userId: string) =>
      team.members.find((m) => m.userId.toString() === userId.toString());

    if (findMember(newMemberId)) {
      throw new ConflictException('User is already a member');
    }

    const adminMember = findMember(adminId);
    if (!adminMember || adminMember.role !== 'admin') {
      throw new ForbiddenException('Only admins can add members');
    }

    team.members.push({
      userId: new Types.ObjectId(newMemberId),
      role: 'member',
    });

    return team.save();
  }

  async getTeamsForUser(userId: string) {
    return this.teamModel
      .find({ 'members.userId': userId.toString() })
      .populate('members.userId', 'name email');
  }
}
