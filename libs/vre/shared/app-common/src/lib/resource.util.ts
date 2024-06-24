import { PermissionUtil, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';

export class ResourceUtil {
  public static isEditableByUser(instance: ReadResource | ReadValue) {
    const permissions = PermissionUtil.allUserPermissions(instance.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR');
    return permissions.indexOf(PermissionUtil.Permissions.M) !== -1;
  }

  public static isDeletableByUser(instance: ReadResource | ReadValue) {
    const permissions = PermissionUtil.allUserPermissions(instance.userHasPermission as 'RV' | 'V' | 'M' | 'D' | 'CR');
    return permissions.indexOf(PermissionUtil.Permissions.D) !== -1;
  }
}
