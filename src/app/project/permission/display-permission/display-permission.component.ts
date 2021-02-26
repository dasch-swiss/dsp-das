import { Component, Input, OnChanges } from '@angular/core';

enum Permissions {
    /**
     * restricted view
     */
    RV = 0,
    /**
     * view permission
     */
    V = 1,
    /**
     * change rights permission
     */
    C = 2,
    /**
     * modify permission
     */
    M = 3,
    /**
     * delete permission
     */
    D = 4,
    /**
     * change rights permission
     */
    CR = 5,
}

// use an attribute selector because in a table row no additional eles can be added
// (https://medium.com/javascript-everyday/when-to-use-an-attribute-selector-for-angular-components-7e788ba1bfe7)
/* tslint:disable:component-selector */
@Component({
    selector: '[app-display-permission]',
    templateUrl: './display-permission.component.html',
    styleUrls: ['./display-permission.component.scss']
})
export class DisplayPermissionComponent implements OnChanges {

    @Input() displayPermission: 'RV' | 'V' | 'C' | 'M' | 'D' | 'CR';

    @Input() role: string;

    grantedPermissions: Permissions[];

    /**
     * Permission codes in ascending order.
     */
    permissionHierarchy = [Permissions.RV, Permissions.V, Permissions.C, Permissions.M, Permissions.D, Permissions.CR];

    constructor() {
    }

    /**
     * Given a permission, returns the permission and all implied permissions.
     *
     * @param highestPermission highest permission
     */
    getAllPermissions(highestPermission: 'RV' | 'V' | 'C' | 'M' | 'D' | 'CR') {

        const givenPermIndex = this.permissionHierarchy.indexOf(Permissions[highestPermission]);

        if (givenPermIndex === -1) {
            throw new Error('Invalid permission given' + highestPermission);
        }

        // return highest permission with all implied permissions
        // (slice does not return the element identified by the second arg 'end', so +1)
        return this.permissionHierarchy.slice(0, givenPermIndex + 1);

    }

    ngOnChanges(): void {
        this.grantedPermissions = this.getAllPermissions(this.displayPermission);
    }

}
