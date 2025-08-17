import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { TeamsService } from 'src/teams/teams.service';

@Injectable()
export class TeamRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private teamsService: TeamsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTeamRoles = this.reflector.get<string[]>(
      'teamRoles',
      context.getHandler(),
    );

    // If no @TeamRoles decorator → skip this guard
    if (!requiredTeamRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = request.params.teamId || request.body.teamId;

    console.log('TeamID: ', teamId);

    if (!teamId) {
      throw new ForbiddenException('Team ID required for this action');
    }

    const team = await this.teamsService.findById(teamId);
    if (!team) throw new ForbiddenException('Team not found');

    console.log('Team members: ', team.members);

    const membership = team.members.find(
      (m) => m.userId.toString() === user.id,
    );

    console.log('membership: ', membership);

    if (!membership) throw new ForbiddenException('Not part of this team');

    if (!requiredTeamRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `Only [${requiredTeamRoles.join(', ')}] can perform this action`,
      );
    }

    return true;
  }
}
