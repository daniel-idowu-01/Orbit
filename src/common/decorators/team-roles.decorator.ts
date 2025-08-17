import { SetMetadata } from '@nestjs/common';

export const TEAM_ROLES_KEY = 'teamRoles';

export const TeamRoles = (...roles: string[]) =>
  SetMetadata(TEAM_ROLES_KEY, roles);
