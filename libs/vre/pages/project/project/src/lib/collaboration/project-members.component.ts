import { Component, Input } from '@angular/core';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { AdminGroupsApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { EMPTY, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-project-members',
  template: ` <app-project-members-row [user]="user" *ngFor="let user of users" [groups]="groups$ | async" />`,
})
export class ProjectMembersComponent {
  @Input({ required: true }) users!: ReadUser[];

  groups$ = this._store.select(ProjectsSelectors.currentProject).pipe(
    switchMap(project => {
      if (!project) {
        return EMPTY;
      }
      return this._adminGroupsApi.getAdminGroups().pipe(
        map(response => {
          return (response.groups ?? []).filter(group => (group.project!.id as unknown as string) === project.id);
        })
      );
    })
  );

  constructor(
    private _adminGroupsApi: AdminGroupsApiService,
    private _store: Store
  ) {}
}
