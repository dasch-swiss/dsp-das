import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { KnoraApiConnection, ReadUser } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AdminUsersApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { CreateUserDialogComponent } from '@dasch-swiss/vre/pages/system/system';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { BehaviorSubject, combineLatest, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs';
import { CollaborationPageService } from '../collaboration-page.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-user',
  template: `
    <h3>{{ 'pages.project.addUser.title' | translate }}</h3>
    <div style="display: flex; gap: 8px; align-items: center">
      <mat-form-field style="flex: 1">
        <mat-label>{{ 'pages.project.addUser.select' | translate }}</mat-label>
        <input matInput [matAutocomplete]="user" [formControl]="usernameControl" />

        <mat-autocomplete #user="matAutocomplete" (optionSelected)="addUser($event.option.value)">
          <mat-option *ngIf="loading" [disabled]="true">
            <app-progress-indicator />
          </mat-option>
          <ng-container *ngIf="!loading && (filteredUsers$ | async) as filteredUsers">
            <mat-option *ngFor="let user of filteredUsers" [value]="user.id" [disabled]="isMember(user)">
              {{ getLabel(user) }}
            </mat-option>

            <mat-option *ngIf="filteredUsers.length === 0" [disabled]="true">No results</mat-option>
          </ng-container>
        </mat-autocomplete>
      </mat-form-field>

      <button mat-raised-button color="primary" class="add-new create-user-btn" (click)="createUser()">
        {{ 'pages.project.addUser.newUser' | translate }}
      </button>
    </div>
  `,
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent {
  @Input({ required: true }) projectUuid!: string;

  get projectIri(): string {
    return this._projectService.uuidToIri(this.projectUuid);
  }

  usernameControl = new FormControl<string | null>(null);
  users: ReadUser[] = [];

  loading = false;
  reloadListSubject = new BehaviorSubject(null);

  filteredUsers$ = combineLatest([
    this.usernameControl.valueChanges.pipe(startWith(null)),
    this.reloadListSubject.pipe(
      switchMap(() => this.collaborationPageService.reloadProjectMembers$),
      tap(() => {
        this.loading = true;
      }),
      switchMap(() => this._userApiService.list()),
      tap(() => {
        this.loading = false;
        this._cdr.detectChanges();
      }),
      map(response => response.users),
      shareReplay(1)
    ),
  ]).pipe(map(([filterVal, users_]) => (filterVal ? this._filter(users_, filterVal) : users_)));

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog,
    private _userApiService: UserApiService,
    private _projectService: ProjectService,
    private readonly _adminUsersApi: AdminUsersApiService,
    public collaborationPageService: CollaborationPageService,
    private _cdr: ChangeDetectorRef
  ) {}

  getLabel(user: ReadUser): string {
    const usernameLabel = user.username ? `${user.username} | ` : '';
    const emailLabel = user.email ? `${user.email} | ` : '';
    return `${usernameLabel}${emailLabel}${user.givenName} ${user.familyName}`;
  }

  isMember(user: ReadUser): boolean {
    return user.projects
      ? user.projects.map(project => project.id as unknown as string).includes(this.projectIri)
      : false;
  }

  addUser(userId: string) {
    this._dspApiConnection.admin.usersEndpoint.addUserToProjectMembership(userId, this.projectIri).subscribe(() => {
      this.usernameControl.setValue(null);
      this.collaborationPageService.reloadProjectMembers();
      this.reloadListSubject.next(null);
    });
  }

  createUser() {
    this._dialog
      .open<CreateUserDialogComponent, undefined, string>(
        CreateUserDialogComponent,
        DspDialogConfig.dialogDrawerConfig(undefined, true)
      )
      .afterClosed()
      .pipe(
        filter(result => result !== undefined),
        switchMap(userId =>
          this._adminUsersApi.postAdminUsersIriUseririProjectMembershipsProjectiri(userId!, this.projectIri)
        )
      )
      .subscribe(() => {
        this.collaborationPageService.reloadProjectMembers();
      });
  }

  private _filter(list: ReadUser[], filterVal: string) {
    return list.filter(user => `${user.givenName} ${user.familyName}`.toLowerCase().includes(filterVal.toLowerCase()));
  }
}
