import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './schemas/project.schema';
import { Team } from '../teams/schemas/team.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
  ) {}

  async createProject(name: string, teamId: string, userId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException('Team not found');

    const member = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) throw new ForbiddenException('You are not part of this team');

    const existingProject = await this.projectModel.findOne({
      name,
      team: new Types.ObjectId(teamId),
    });

    if (existingProject) {
      throw new ForbiddenException(
        'Project with this name already exists in the team',
      );
    }

    return this.projectModel.create({
      name,
      team: new Types.ObjectId(teamId),
      createdBy: new Types.ObjectId(userId),
    });
  }

  async getProjectsByTeam(teamId: string, userId: string) {
    const team = await this.teamModel.findById(teamId);
    if (!team) throw new NotFoundException('Team not found');

    const member = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) throw new ForbiddenException('You are not part of this team');

    return this.projectModel.find({
      team: new Types.ObjectId(teamId),
    });
  }
}
