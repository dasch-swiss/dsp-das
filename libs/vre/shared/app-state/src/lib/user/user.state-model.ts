import { ReadUser, User } from "@dasch-swiss/dsp-js";

export class UserStateModel {
    isLoading: boolean | undefined;
    user: User | ReadUser | null | undefined;
    userProjectGroups: string[] = []; //before was projectAdmin
    isMemberOfSystemAdminGroup: boolean = false;
}
