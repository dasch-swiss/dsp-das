import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { AdminAPIApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { CollaborationPageService } from '../collaboration-page.service';

@Component({
  selector: 'app-select-group',
  template: `
    @if (groups$ | async; as groups) {
      @if (groups.length > 0) {
        <mat-form-field>
          <mat-select
            [placeholder]="'pages.project.collaboration.permissionGroup' | translate"
            [formControl]="groupCtrl"
            multiple
            (selectionChange)="updateGroupsMembership($event.value)">
            @for (group of groups; track group) {
              <mat-option [value]="group.id" [disabled]="!user.status">
                {{ group.name }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
      @if (groups.length === 0) {
        <div class="center">{{ 'pages.project.collaboration.noGroupDefined' | translate }}</div>
      }
    }
  `,
  styles: [
    `
      :host ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SelectGroupComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) user!: ReadUser;

  groups$ = this._collaborationPageService.groups$;
  groupCtrl!: FormControl<string[] | null>;

  constructor(
    private readonly _adminApiService: AdminAPIApiService,
    private readonly _collaborationPageService: CollaborationPageService
  ) {}

  ngOnInit() {
    this.groupCtrl = new FormControl<string[]>(this._getPermissions());
  }

  updateGroupsMembership(newGroups: string[]): void {
    const userGroups = this.user.groups || [];
    if (newGroups.length > userGroups.length) {
      const groupIdAdded = newGroups.find(groupId =>
        userGroups.map(group => group.id).every(_groupId => _groupId !== groupId)
      );
      if (!groupIdAdded) {
        throw new AppError('Group should exist');
      }
      this._adminApiService
        .postAdminUsersIriUseririGroupMembershipsGroupiri(this.user.id, groupIdAdded)
        .subscribe(() => {
          this._collaborationPageService.reloadProjectMembers();
        });
    } else if (newGroups.length < userGroups.length) {
      const groupIdRemoved = userGroups.find(group => newGroups.indexOf(group.id) === -1);

      if (!groupIdRemoved) {
        throw new AppError('Group should exist');
      }
      this._adminApiService
        .deleteAdminUsersIriUseririGroupMembershipsGroupiri(this.user.id, groupIdRemoved.id)
        .subscribe(() => {
          this._collaborationPageService.reloadProjectMembers();
        });
    }
  }

  private _getPermissions() {
    if (this.user.permissions?.groupsPerProject) {
      return this.user.permissions?.groupsPerProject[this.projectId];
    } else {
      return [];
    }
  }
}
