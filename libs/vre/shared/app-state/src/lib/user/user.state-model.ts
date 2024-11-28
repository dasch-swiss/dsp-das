import { ReadUser } from '@dasch-swiss/dsp-js';

export class UserStateModel {
  isLoading = false; // loading state
  user: ReadUser | null = null; // the currently logged in user
  userProjectAdminGroups: string[] = []; // users permission groups
  isMemberOfSystemAdminGroup = false; // current user is system admin
  allUsers: ReadUser[] = []; // other user data in the system
  usersLoading = false; // loading state for all users
}
