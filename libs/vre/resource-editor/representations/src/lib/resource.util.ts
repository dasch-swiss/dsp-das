import { PermissionUtil, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';

export type Interaction = keyof typeof PermissionUtil.Permissions; // "RV" | "V" | "M" | "D" | "CR"

export class ResourceUtil {
  public static userCanView(instance: ReadResource | ReadValue) {
    return ResourceUtil.isInteractionGranted(instance, 'V');
  }

  public static userCanEdit(instance: ReadResource | ReadValue) {
    return ResourceUtil.isInteractionGranted(instance, 'M');
  }

  public static userCanDelete(instance: ReadResource | ReadValue) {
    return ResourceUtil.isInteractionGranted(instance, 'D');
  }

  public static isInteractionGranted(resource: ReadResource | ReadValue, interaction: Interaction): boolean {
    const permissions = PermissionUtil.allUserPermissions(resource.userHasPermission as Interaction);
    return permissions.includes(PermissionUtil.Permissions[interaction]);
  }

  public static versionIsValid(version: string) {
    const xsdDateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return xsdDateRegex.test(version);
  }
}
