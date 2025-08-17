import { Controller, Post, Body, Param, Get, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { TeamRolesGuard } from 'src/common/guards/team-roles.guard';
import { TeamRoles } from 'src/common/decorators/team-roles.decorator';
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post(':teamId')
  @UseGuards(TeamRolesGuard)
  @TeamRoles("admin", "manager")
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
