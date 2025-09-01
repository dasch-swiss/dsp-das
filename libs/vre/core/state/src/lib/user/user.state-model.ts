import { ReadUser } from '@dasch-swiss/dsp-js';

export class UserStateModel {
  user: ReadUser | null = null;
  userProjectAdminGroups: string[] = []; // before was projectAdmin
  userProjectGroups: string[] = [];
  isMemberOfSystemAdminGroup = false; // before was sysAdmin
}
