export interface EditUser {
  userId?: string;
  projectUuid?: string;
}

export interface UserFormModel {
  givenName: string;
  familyName: string;
  email: string;
  username: string;
  password: string;
  lang: string;
  status: boolean;
  systemAdmin: boolean;
}

export type UserFormControlName = keyof UserFormModel;

export type ValidationMessages = {
  [K in UserFormControlName]?: { [error: string]: string };
};
