import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskSchema } from './schemas/task.schema';
import { ProjectSchema } from 'src/projects/schemas/project.schema';
import { TeamSchema } from 'src/teams/schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Task', schema: TaskSchema },
      { name: 'Project', schema: ProjectSchema },
      { name: 'Team', schema: TeamSchema },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
