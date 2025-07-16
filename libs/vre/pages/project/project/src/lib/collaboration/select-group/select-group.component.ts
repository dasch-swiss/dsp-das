import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AdminUsersApiService, Group } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { LoadProjectMembershipAction } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { filter, from, merge, mergeMap, take, takeLast } from 'rxjs';

@Component({
  selector: 'app-select-group',
  template: `
    <mat-form-field *ngIf="groups.length > 0">
      <mat-select
        placeholder="Permission group"
        [formControl]="groupCtrl"
        multiple
        (selectionChange)="onGroupChange($event)">
        <mat-option *ngFor="let group of groups; trackBy: trackByFn" [value]="group.id" [disabled]="disabled">
          {{ group.name }}
        </mat-option>
      </mat-select>
    </mat-form-field>

    <div *ngIf="groups.length === 0" class="center">No group defined yet.</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectGroupComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) user!: ReadUser;
  @Input({ required: true }) groups!: Group[];

  get permissions() {
    if (this.user.permissions?.groupsPerProject) {
      return this.user.permissions?.groupsPerProject[this.projectId];
    } else {
      return [];
    }
  }

  get disabled() {
    return !this.user.status;
  }

  groupCtrl!: FormControl<string[] | null>;

  trackByFn = (item: Group) => item.id;

  constructor(
    private _userApiService: UserApiService,
    private _adminUsersApiService: AdminUsersApiService,
    private _store: Store
  ) {}

  ngOnInit() {
    this.groupCtrl = new FormControl<string[]>(this.permissions);
    console.log('this', this);
  }

  onGroupChange(event: MatSelectChange) {
    this._updateGroupsMembership2(this.user.id, event.value);
  }

  private _sort(arrOne: string[], arrTwo: string[]): boolean {
    return [...arrOne].sort().join(',') !== [...arrTwo].sort().join(',');
  }

  private _updateGroupsMembership(userIri: string, groups: string[]): void {
    const currentUserGroups: string[] = [];
    this._userApiService.getGroupMembershipsForUser(userIri).subscribe(response => {
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
        .pipe(takeLast(1))
        .subscribe(() => {
          if (this.projectId) {
            this._store.dispatch(new LoadProjectMembershipAction(this.projectId));
          }
        });
    });
  }

  private _updateGroupsMembership2(userIri: string, newGroups: string[]): void {
    console.log(this.user.groups, newGroups);

    if (newGroups.length > this.user.groups.length) {
      const groupIdAdded = newGroups.find(groupId =>
        this.user.groups.map(group => group.id).every(_groupId => _groupId !== groupId)
      );
      if (!groupIdAdded) {
        throw new AppError('Group should exist');
      }
      this._adminUsersApiService
        .postAdminUsersIriUseririGroupMembershipsGroupiri(this.user.id, groupIdAdded)
        .subscribe(() => {
          // TODO change
          if (this.projectId) {
            this._store.dispatch(new LoadProjectMembershipAction(this.projectId));
          }
        });
    } else if (newGroups.length < this.user.groups.length) {
      const groupIdRemoved = this.user.groups.find(group => newGroups.indexOf(group.id) === -1);

      if (!groupIdRemoved) {
        throw new AppError('Group should exist');
      }
      this._adminUsersApiService
        .deleteAdminUsersIriUseririGroupMembershipsGroupiri(this.user.id, groupIdRemoved.id)
        .subscribe();
    }
  }
}
