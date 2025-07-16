import { ChangeDetectionStrategy, Component, Inject, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { KnoraApiConnection, ReadUser } from '@dasch-swiss/dsp-js';
import { AdminUsersApiService, UserDto } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { CreateUserDialogComponent } from '@dasch-swiss/vre/pages/system/system';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { combineLatest, map, startWith, Subject } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-user',
  template: `
    <div class="app-toolbar transparent more-space-bottom">
      <div class="app-toolbar-row toolbar-subtitle">
        <h3 class="mat-body subtitle">{{ 'pages.project.addUser.description' | translate }}</h3>
      </div>
      <div class="app-toolbar-row toolbar-form">
        <h2 class="mat-headline-6">{{ 'pages.project.addUser.title' | translate }}</h2>

        <span class="fill-remaining-space"></span>

        <span class="app-toolbar-action select-form">
          <div class="form-content">
            <mat-form-field class="large-field select-user">
              <mat-label>{{ 'pages.project.addUser.select' | translate }}</mat-label>
              <input matInput [matAutocomplete]="user" [formControl]="usernameControl" />

              <mat-autocomplete #user="matAutocomplete" (optionSelected)="addUser($event.option.value)">
                <mat-option *ngIf="!users?.length" class="loading-option">
                  <div class="loading-container">
                    <mat-spinner diameter="20" />
                    <span>{{ 'pages.project.addUser.usersLoading' | translate }}</span>
                  </div>
                </mat-option>
                <mat-option
                  *ngFor="let user of filteredUsers$ | async; trackBy: trackByFn"
                  [value]="user.id"
                  [disabled]="isMember(user)">
                  {{ getLabel(user) }}
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
          </div>
        </span>

        <span class="fill-remaining-space"></span>

        <span class="app-toolbar-action select-form">
          <button mat-raised-button color="primary" class="add-new create-user-btn" (click)="createUser()">
            {{ 'pages.project.addUser.newUser' | translate }}
          </button>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnDestroy {
  @Input({ required: true }) projectUuid!: string;

  private readonly _destroyed$: Subject<void> = new Subject<void>();

  usernameControl = new FormControl<string | null>(null);

  users: ReadUser[] = [];
  filteredUsers$ = combineLatest([
    this.usernameControl.valueChanges.pipe(
      startWith(null) // initial empty string value for autocomplete to open on focus
    ),
    this._adminUsersApiService.getAdminUsers().pipe(map(response => response.users || [])),
  ]).pipe(map(([filterVal, users_]) => (filterVal ? this._filter(users_, filterVal) : users_)));

  get projectIri(): string {
    return this._projectService.uuidToIri(this.projectUuid);
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _dialog: MatDialog,
    private _adminUsersApiService: AdminUsersApiService,
    private fb: FormBuilder,
    private _projectService: ProjectService
  ) {}

  private _filter(list: UserDto[], filterVal: string) {
    return list.filter(user => this.fullName(user).toLowerCase().includes(filterVal.toLowerCase()));
  }

  getLabel(user: UserDto): string {
    const usernameLabel = user.username ? `${user.username} | ` : '';
    const emailLabel = user.email ? `${user.email} | ` : '';
    return `${usernameLabel}${emailLabel}${user.givenName} ${user.familyName}`;
  }

  isMember(user: UserDto): boolean {
    return user.projects
      ? user.projects.map(project => project.id as unknown as string).includes(this.projectIri)
      : false;
  }

  fullName(user: UserDto): string {
    return `${user.givenName} ${user.familyName}`;
  }

  addUser(userId: string) {
    this._dspApiConnection.admin.usersEndpoint.addUserToProjectMembership(userId, this.projectIri).subscribe();
  }

  createUser() {
    this._dialog.open(CreateUserDialogComponent, DspDialogConfig.dialogDrawerConfig<string>(this.projectUuid, true));
  }

  trackByFn = (index: number) => index;

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
