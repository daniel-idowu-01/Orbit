import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post(':teamId')
  createProject(
    @Param('teamId') teamId: string,
    @Body('name') name: string,
    @GetUser('_id') userId: string,
  ) {
    return this.projectsService.createProject(name, teamId, userId);
  }

  @Get(':teamId')
  getProjects(@Param('teamId') teamId: string, @GetUser('_id') userId: string) {
    return this.projectsService.getProjectsByTeam(teamId, userId);
  }
}
