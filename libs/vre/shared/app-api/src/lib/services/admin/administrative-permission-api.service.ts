import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AdministrativePermissionsResponse,
  CreateAdministrativePermission,
} from '@dasch-swiss/dsp-js';
import { BaseApi } from '../base-api';

@Injectable({ providedIn: 'root' })
export class AdministrativePermissionApiService extends BaseApi {
  constructor(private _http: HttpClient) {
    super('admin/permissions/ap');
  }

  list(projectIri: string) {
    return this._http.get<AdministrativePermissionsResponse>(
      `${this.baseUri}/${encodeURIComponent(projectIri)}`
    );
  }

  get(projectIri: string, groupIri: string) {
    return this._http.get<AdministrativePermissionsResponse>(
      `${this._permissionRoute(projectIri)}/${encodeURIComponent(groupIri)}`
    );
  }

  create(permission: CreateAdministrativePermission) {
    if (!permission.forGroup || !permission.forProject) {
      throw new Error(
        'Group and project are required when creating a new administrative permission.'
      );
    }

    if (permission.hasPermissions.length === 0) {
      throw new Error('At least one permission is expected.');
    }

    return this._http.post<AdministrativePermissionsResponse>(
      this.baseUri,
      permission
    );
  }

  private _permissionRoute(projectIri: string) {
    return `${this.baseUri}/${encodeURIComponent(projectIri)}`;
  }
}
