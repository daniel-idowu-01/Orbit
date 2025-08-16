import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { Task } from '../tasks/schemas/task.schema';
import { Project } from '../projects/schemas/project.schema';
import { Team } from '../teams/schemas/team.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
  ) {}

  async addComment(taskId: string, content: string, userId: string) {
    const task = await this.taskModel.findById(taskId).populate('projectId');
    if (!task) throw new NotFoundException('Task not found');

    const project = await this.projectModel.findById(task.projectId);
    if (!project) throw new NotFoundException('Project not found');

    const team = await this.teamModel.findById(project.teamId);
    if (!team) throw new NotFoundException('Team not found');

    const member = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) throw new ForbiddenException('You are not part of this team');

    return this.commentModel.create({
      content,
      author: new Types.ObjectId(userId),
      task: new Types.ObjectId(taskId),
    });
  }

  async getComments(taskId: string, userId: string) {
    const task = await this.taskModel.findById(taskId).populate('projectId');
    if (!task) throw new NotFoundException('Task not found');

    const project = await this.projectModel.findById(task.projectId);
    if (!project) throw new NotFoundException('Project not found');

    const team = await this.teamModel.findById(project.teamId);
    if (!team) throw new NotFoundException('Team not found');

    const member = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) throw new ForbiddenException('You are not part of this team');

    return this.commentModel
      .find({ taskId: new Types.ObjectId(taskId) })
      .populate('authorId', 'name email');
  }
}
