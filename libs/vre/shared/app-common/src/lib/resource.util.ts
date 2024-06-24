import { PermissionUtil, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';

export class ResourceUtil {
  public static userCanEdit(instance: ReadResource | ReadValue) {
    const permissions = PermissionUtil.allUserPermissions(instance.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR');
    return permissions.indexOf(PermissionUtil.Permissions.M) !== -1;
  }

  public static userCanDelete(instance: ReadResource | ReadValue) {
    const permissions = PermissionUtil.allUserPermissions(instance.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR');
    return permissions.indexOf(PermissionUtil.Permissions.D) !== -1;
  }
}
