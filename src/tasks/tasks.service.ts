import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { Project } from '../projects/schemas/project.schema';
import { Team } from '../teams/schemas/team.schema';

interface TaskFilter {
  status?: string;
  assignee?: string;
  priority?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
  ) {}

  async createTask(
    title: string,
    description: string,
    projectId: string,
    userId: string,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    const team = await this.teamModel.findById(
      new Types.ObjectId(project.teamId),
    );
    if (!team) throw new NotFoundException('Team not found');

    const member = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) throw new ForbiddenException('You are not part of this team');

    return this.taskModel.create({
      title,
      description,
      projectId: new Types.ObjectId(projectId),
    });
  }

  async assignTask(taskId: string, assigneeId: string, userId: string) {
    const task = await this.taskModel.findById(taskId).populate('projectId');
    if (!task) throw new NotFoundException('Task not found');

    const project = await this.projectModel.findById(task.projectId);
    if (!project) throw new NotFoundException('Project not found');

    const team = await this.teamModel.findById(project.teamId);
    if (!team) throw new NotFoundException('Team not found');

    const currentUser = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!currentUser || !['admin', 'manager'].includes(currentUser.role)) {
      throw new ForbiddenException('Only managers/admins can assign tasks');
    }

    task.assigneeId = new Types.ObjectId(assigneeId);
    return task.save();
  }

  async updateStatus(taskId: string, status: string, userId: string) {
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

    if (
      task.assigneeId?.toString() !== userId.toString() &&
      !['admin', 'manager'].includes(member.role)
    ) {
      throw new ForbiddenException('Not allowed to update this task');
    }

    task.status = status;
    return task.save();
  }

  async getTasksByProject(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    const team = await this.teamModel.findById(project.teamId);
    if (!team) throw new NotFoundException('Team not found');

    const member = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) throw new ForbiddenException('You are not part of this team');

    return this.taskModel.find({ projectId: new Types.ObjectId(projectId) });
  }

  async getUserStats(userId: string) {
    const tasks = await this.taskModel.find({
      assigneeId: new Types.ObjectId(userId),
    });

    const now = new Date();
    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE',
    );

    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'DONE').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      overdue: overdueTasks.length,
      completionRate:
        tasks.length > 0
          ? Math.round(
              (tasks.filter((t) => t.status === 'DONE').length / tasks.length) *
                100,
            )
          : 0,
    };
  }

  async getFilteredTasks(
    projectId: string,
    filters: TaskFilter,
    userId: string,
  ) {
    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    const team = await this.teamModel.findById(project.teamId);
    if (!team) throw new NotFoundException('Team not found');

    const member = team.members.find(
      (m) => m.userId.toString() === userId.toString(),
    );
    if (!member) throw new ForbiddenException('You are not part of this team');

    const filterQuery: any = { projectId: new Types.ObjectId(projectId) };

    if (filters.status) {
      const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
      if (validStatuses.includes(filters.status)) {
        filterQuery.status = filters.status;
      }
    }

    if (filters.assignee) {
      filterQuery.assigneeId = new Types.ObjectId(filters.assignee);
    }

    if (filters.priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (validPriorities.includes(filters.priority)) {
        filterQuery.priority = filters.priority;
      }
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      filterQuery.dueDate = {};
      if (filters.dueDateFrom) {
        filterQuery.dueDate.$gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        filterQuery.dueDate.$lte = new Date(filters.dueDateTo);
      }
    }

    return this.taskModel
      .find(filterQuery)
      .populate('assigneeId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
