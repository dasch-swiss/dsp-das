import { ReadUser } from '@dasch-swiss/dsp-js';

export class UserPermissions {
  static hasSysAdminRights(user: ReadUser): boolean {
    return this._isPartOfProjectGroup(
      user,
      'http://www.knora.org/ontology/knora-admin#SystemProject',
      'http://www.knora.org/ontology/knora-admin#SystemAdmin'
    );
  }

  static hasProjectAdminRights(user: ReadUser, projectUuid: string): boolean {
    if (this.hasSysAdminRights(user)) {
      return true;
    }

    return this._isPartOfProjectGroup(user, projectUuid, 'http://www.knora.org/ontology/knora-admin#ProjectAdmin');
  }

  static hasProjectMemberRights(user: ReadUser, projectUuid: string): boolean {
    if (this.hasProjectAdminRights(user, projectUuid)) {
      return true;
    }

    return this._isPartOfProjectGroup(user, projectUuid, 'http://www.knora.org/ontology/knora-admin#ProjectMember');
  }

  private static _isPartOfProjectGroup(user: ReadUser, projectUuid: string, projectGroup: string): boolean {
    if (!user.permissions.groupsPerProject) {
      return false;
    }

    const projectFound = user.permissions.groupsPerProject[projectUuid];

    if (projectFound === undefined) {
      return false;
    }

    return projectFound.includes(projectGroup);
  }
}
