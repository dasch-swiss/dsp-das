import { Injectable } from '@angular/core';
import { AdminProjectsLegalInfoApiService, ProjectLicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { EMPTY } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PaginatedApiService {
  constructor(private _copyrightApi: AdminProjectsLegalInfoApiService) {}

  getLicenses(projectShortcode: string, pageSize = 100) {
    return this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(projectShortcode).pipe(
      expand(response => {
        if (response.pagination.currentPage < response.pagination.totalPages) {
          return this._copyrightApi.getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(
            projectShortcode,
            response.pagination.currentPage + 1,
            pageSize
          );
        } else {
          return EMPTY;
        }
      }),
      map(data => data.data),
      reduce((acc, data) => acc.concat(data), [] as ProjectLicenseDto[])
    );
  }
}
