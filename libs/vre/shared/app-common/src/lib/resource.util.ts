import { PermissionUtil, ReadResource } from '@dasch-swiss/dsp-js';

export class ResourceUtil {
  public static isEditableByUser(resource: ReadResource) {
    const permissions = PermissionUtil.allUserPermissions(resource.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR');
    return permissions.indexOf(PermissionUtil.Permissions.M) !== -1;
  }
}
