// tasks/tasks.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { CreateTaskDto } from './schemas/create-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post(':projectId')
  createTask(
    @Param('projectId') projectId: string,
    @Body() createTaskDto: CreateTaskDto,
    @GetUser('_id') userId: string,
  ) {
    return this.tasksService.createTask(
      createTaskDto.title,
      createTaskDto?.description || 'No description',
      projectId,
      userId,
    );
  }

  @Patch(':taskId/assign')
  assignTask(
    @Param('taskId') taskId: string,
    @Body('assigneeId') assigneeId: string,
    @GetUser('_id') userId: string,
  ) {
    return this.tasksService.assignTask(taskId, assigneeId, userId);
  }

  @Patch(':taskId/status')
  updateStatus(
    @Param('taskId') taskId: string,
    @Body('status') status: string,
    @GetUser('_id') userId: string,
  ) {
    return this.tasksService.updateStatus(taskId, status, userId);
  }

  @Get(':projectId')
  getTasks(
    @Param('projectId') projectId: string,
    @GetUser('_id') userId: string,
  ) {
    return this.tasksService.getTasksByProject(projectId, userId);
  }

  @Get('dashboard/stats')
  async getDashboardStats(@GetUser('_id') userId: string) {
    return this.tasksService.getUserStats(userId);
  }
}
