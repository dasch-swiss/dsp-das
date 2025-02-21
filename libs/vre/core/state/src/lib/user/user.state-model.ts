import { ReadUser } from '@dasch-swiss/dsp-js';

export class UserStateModel {
  isLoading = false;
  user: ReadUser | null = null;
  userGroups: string[] = [];
  isMemberOfSystemAdminGroup = false;
  allUsers: ReadUser[] = [];
  areUsersLoading = false;
}
