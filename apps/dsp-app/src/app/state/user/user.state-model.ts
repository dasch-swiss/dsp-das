import { ReadUser, User } from "@dasch-swiss/dsp-js";

export class UserStateModel {
    isLoading: boolean;
    user: User | ReadUser;
    readUser: ReadUser;
}
