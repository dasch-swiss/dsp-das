import { Injectable } from '@angular/core';
import { Constants, ReadProject } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';

@Injectable({
  providedIn: 'root',
})
export class UserPermissionService {
  isProjectAdmin(permissions?: PermissionsData, project?: ReadProject): boolean {
    if (!project || !permissions || !permissions.groupsPerProject) {
      return false;
    }

    return ProjectService.IsMemberOfProjectAdminGroup(permissions.groupsPerProject, project.id);
  }

  isSystemAdmin(permissions: PermissionsData): boolean {
    if (!permissions.groupsPerProject) {
      return false;
    }

    const groupsPerProjectKeys = Object.keys(permissions.groupsPerProject);

    return groupsPerProjectKeys.some(key => {
      if (key === Constants.SystemProjectIRI) {
        return permissions.groupsPerProject?.[key]?.includes(Constants.SystemAdminGroupIRI) ?? false;
      }
      return false;
    });
  }
}
