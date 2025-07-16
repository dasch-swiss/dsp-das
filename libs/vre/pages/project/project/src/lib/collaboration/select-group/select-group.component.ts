import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { AdminUsersApiService, Group } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppError } from '@dasch-swiss/vre/core/error-handler';

@Component({
  selector: 'app-select-group',
  template: `
    <mat-form-field *ngIf="groups.length > 0">
      <mat-select
        placeholder="Permission group"
        [formControl]="groupCtrl"
        multiple
        (selectionChange)="updateGroupsMembership($event.value)">
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

  constructor(private _adminUsersApiService: AdminUsersApiService) {}

  ngOnInit() {
    this.groupCtrl = new FormControl<string[]>(this.permissions);
  }

  updateGroupsMembership(newGroups: string[]): void {
    if (newGroups.length > this.user.groups.length) {
      const groupIdAdded = newGroups.find(groupId =>
        this.user.groups.map(group => group.id).every(_groupId => _groupId !== groupId)
      );
      if (!groupIdAdded) {
        throw new AppError('Group should exist');
      }
      this._adminUsersApiService
        .postAdminUsersIriUseririGroupMembershipsGroupiri(this.user.id, groupIdAdded)
        .subscribe();
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
