import { Injectable } from '@angular/core';
import { AdminProjectsLegalInfoApiService, LicenseDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { Observable } from 'rxjs';
import { finalize, map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProjectCommonService {
  projectShortcode!: string;
  licenses$?: Observable<LicenseDto[]>;
  licensesLoading!: boolean;

  constructor(private _copyrightApi: AdminProjectsLegalInfoApiService) {}

  onInit(projectShortcode: string) {
    if (this.projectShortcode && this.projectShortcode === projectShortcode) {
      return;
    }

    this.projectShortcode = projectShortcode;
    this.licensesLoading = true;

    this.licenses$ = this._copyrightApi
      .getAdminProjectsShortcodeProjectshortcodeLegalInfoLicenses(this.projectShortcode)
      .pipe(
        map(data => data.data),
        finalize(() => {
          this.licensesLoading = false;
        }),
        shareReplay(1)
      );
  }
}
