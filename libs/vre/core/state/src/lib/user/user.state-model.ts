import { ReadUser } from '@dasch-swiss/dsp-js';

export class UserStateModel {
  user: ReadUser | null = null;
  userProjectGroups: string[] = [];
  isMemberOfSystemAdminGroup = false; // before was sysAdmin
}
