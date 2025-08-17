import { Team } from './schemas/team.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class TeamsService {
  constructor(@InjectModel(Team.name) private teamModel: Model<Team>) {}

  async createTeam(name: string, ownerId: string) {
    return this.teamModel.create({
      name,
      owner: new Types.ObjectId(ownerId),
      members: [{ user: new Types.ObjectId(ownerId), role: 'admin' }],
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

  async findById(teamId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async getTeamsForUser(userId: string) {
    return this.teamModel
      .find({ 'members.userId': userId.toString() })
      .populate('members.userId', 'name email');
  }

  async getTeamMembers(teamId: string, userId: string) {
    const team = await this.teamModel
      .findById(teamId)
      .populate('members.userId', 'name email')
      .populate('ownerId', 'name email');

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const isMember = team.members.some(
      (m) => m.userId.toString() === userId.toString(),
    );

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return {
      teamId: team._id,
      teamName: team.name,
      owner: team.ownerId,
      members: team.members,
      memberCount: team.members.length,
    };
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    role: string,
    adminId: string,
  ) {
    const validRoles = ['admin', 'manager', 'member'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(
        'Invalid role. Must be admin, manager, or member',
      );
    }

    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const adminMember = team.members.find(
      (m) => m.userId.toString() === adminId.toString(),
    );
    if (!adminMember || adminMember.role !== 'admin') {
      throw new ForbiddenException('Only admins can update member roles');
    }

    const memberToUpdate = team.members.find(
      (m) => m.userId.toString() === memberId.toString(),
    );
    if (!memberToUpdate) {
      throw new NotFoundException('Member not found in team');
    }

    if (adminId === memberId && adminMember.role === 'admin') {
      const adminCount = team.members.filter((m) => m.role === 'admin').length;
      if (adminCount === 1 && role !== 'admin') {
        throw new ForbiddenException(
          'Cannot remove the last admin from the team',
        );
      }
    }

    memberToUpdate.role = role as 'admin' | 'manager' | 'member';
    return team.save();
  }

  async removeMember(teamId: string, memberId: string, adminId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const adminMember = team.members.find(
      (m) => m.userId.toString() === adminId.toString(),
    );
    if (!adminMember || adminMember.role !== 'admin') {
      throw new ForbiddenException('Only admins can remove members');
    }

    const memberIndex = team.members.findIndex(
      (m) => m.userId.toString() === memberId.toString(),
    );

    if (memberIndex === -1) {
      throw new NotFoundException('Member not found in team');
    }

    if (team.ownerId.toString() === memberId.toString()) {
      throw new ForbiddenException('Cannot remove the team owner');
    }

    if (adminId === memberId) {
      const adminCount = team.members.filter((m) => m.role === 'admin').length;
      if (adminCount === 1) {
        throw new ForbiddenException(
          'Cannot remove the last admin from the team',
        );
      }
    }

    team.members.splice(memberIndex, 1);
    return team.save();
  }
}
