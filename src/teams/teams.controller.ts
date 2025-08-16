import { TeamsService } from './teams.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  Patch,
  Delete
} from '@nestjs/common';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  createTeam(@Body('name') name: string, @GetUser('_id') userId: string) {
    return this.teamsService.createTeam(name, userId);
  }

  @Post(':teamId/members')
  addMember(
    @Param('teamId') teamId: string,
    @Body('newMemberId') newMemberId: string,
    @GetUser('_id') currentUserId: string,
  ) {
    return this.teamsService.addMember(teamId, newMemberId, currentUserId);
  }

  @Get()
  getMyTeams(@GetUser('_id') userId: string) {
    return this.teamsService.getTeamsForUser(userId);
  }

  @Patch(':teamId/members/:memberId/role')
  updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body('role') role: string,
    @GetUser('_id') adminId: string,
  ) {
    return this.teamsService.updateMemberRole(teamId, memberId, role, adminId);
  }

  @Delete(':teamId/members/:memberId')
  removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @GetUser('_id') adminId: string,
  ) {
    return this.teamsService.removeMember(teamId, memberId, adminId);
  }
}
