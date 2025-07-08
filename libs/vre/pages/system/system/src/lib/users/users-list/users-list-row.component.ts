import { Component, Input, OnDestroy } from '@angular/core';
import { Constants, ReadUser } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { LoadProjectMembershipAction } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { from, merge, Subject } from 'rxjs';
import { filter, mergeMap, take, takeLast, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-users-list-row',
  template: ` <!-- avatar -->
    <td class="avatar-cell">
      <img appAdminImage [image]="user.email" [type]="'user'" alt="avatar" class="avatar-image" />
    </td>

    <!-- name and e-mail address -->
    <td class="table-info">
      <h5 class="mat-subtitle-1 info-names">
        <!-- Names hidden on phone devices -->
        {{ user.givenName }} {{ user.familyName }}
      </h5>
      <p class="mat-subtitle-2">
        <span class="info-username">{{ user.username }} </span>
        <!-- Email hidden on phone devices -->
        <span class="info-email">| {{ user.email }}</span>
        <!-- TODO: question: how public should the email address be? -->
      </p>
    </td>

    <!-- admin: only in project view -->
    <td class="table-admin-chip">
      <mat-chip-listbox *ngIf="projectUuid">
        <mat-chip class="admin-chip" *ngIf="isProjectAdmin(user.permissions)">Admin</mat-chip>
      </mat-chip-listbox>
      <mat-chip-listbox *ngIf="!projectUuid && isSystemAdmin(user.permissions)">
        <mat-chip class="sys-admin-chip">System Admin</mat-chip>
      </mat-chip-listbox>
    </td>

    <!-- group: only in project view -->
    <td class="table-select-group">
      <app-select-group
        *ngIf="(isProjectOrSystemAdmin$ | async) === true && projectUuid"
        [projectCode]="(project$ | async)?.shortcode"
        [projectid]="(project$ | async)?.id"
        [permissions]="user.permissions.groupsPerProject[(project$ | async)?.id]"
        [disabled]="!status"
        (groupChange)="updateGroupsMembership(user.id, $event)" />
    </td>

    <!-- action: menu with edit, remove, etc. -->
    <td class="table-action"></td>`,
})
export class UsersListRowComponent implements OnDestroy {
  @Input({ required: true }) user!: ReadUser;
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private readonly _userApiService: UserApiService,
    private _store: Store
  ) {}

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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

  updateGroupsMembership(userIri: string, groups: string[]): void {
    if (!groups) {
      return;
    }

    const currentUserGroups: string[] = [];
    this._userApiService
      .getGroupMembershipsForUser(userIri)
      .pipe(takeUntil(this._destroy$))
      .subscribe(response => {
        for (const group of response.groups) {
          currentUserGroups.push(group.id);
        }

        const removeOldGroup$ = from(currentUserGroups).pipe(
          filter(oldGroup => groups.indexOf(oldGroup) === -1), // Filter out groups that are no longer in 'groups'
          mergeMap(oldGroup => this._userApiService.removeFromGroupMembership(userIri, oldGroup).pipe(take(1)))
        );

        const addNewGroup$ = from(groups).pipe(
          filter(newGroup => currentUserGroups.indexOf(newGroup) === -1), // Filter out groups that are already in 'currentUserGroups'
          mergeMap(newGroup => this._userApiService.addToGroupMembership(userIri, newGroup).pipe(take(1)))
        );

        merge(removeOldGroup$, addNewGroup$)
          .pipe(takeLast(1), takeUntil(this._destroy$))
          .subscribe(() => {
            if (this.projectUuid) {
              this._store.dispatch(new LoadProjectMembershipAction(this.projectUuid));
            }
          });
      });
  }

  isProjectAdmin(permissions: PermissionsData): boolean {
    if (!permissions.groupsPerProject) {
      return false;
    }

    return ProjectService.IsMemberOfProjectAdminGroup(permissions.groupsPerProject, this.project.id);
  }
}
