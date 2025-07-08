import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CreateUserDialogComponent } from '../create-user-dialog.component';

interface SortProperty {
  key: keyof ReadUser;
  label: string;
}

type UserSortKey = 'familyName' | 'givenName' | 'email' | 'username';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  @Input({ required: true }) status!: boolean;

  _list!: ReadUser[];
  get list(): ReadUser[] {
    return this._list;
  }

  @Input() set list(value: ReadUser[]) {
    this._list = this._sortingService.keySortByAlphabetical(value, this.sortBy as keyof ReadUser);
  }

  @Input() isButtonEnabledToCreateNewUser = false;
  @Input({ required: true }) project!: ReadProject;
  @Output() refreshParent = new EventEmitter<void>();

  // i18n plural mapping
  itemPluralMapping = {
    user: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 User',
      other: '# Users',
    },
    member: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 Member',
      other: '# Members',
    },
  };

  projectUuid!: string;

  sortProps: SortProperty[] = [
    {
      key: 'familyName',
      label: this._ts.instant('pages.system.usersList.sortFamilyName'),
    },
    {
      key: 'givenName',
      label: this._ts.instant('pages.system.usersList.sortGivenName'),
    },
    {
      key: 'email',
      label: 'E-mail',
    },
    {
      key: 'username',
      label: 'Username',
    },
  ];

  sortBy: UserSortKey = (localStorage.getItem('sortUsersBy') as UserSortKey) || 'username';

  isProjectOrSystemAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  isSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);
  project$ = this._store.select(ProjectsSelectors.currentProject);
  username$ = this._store.select(UserSelectors.username);

  disableMenu$ = combineLatest([this.isProjectOrSystemAdmin$, this.isSysAdmin$]).pipe(
    map(
      ([isProjectAdmin, isSysAdmin]) =>
        this.project.status === false || (!isProjectAdmin && !isSysAdmin && !!this.projectUuid)
    )
  );

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _sortingService: SortingService,
    private readonly _store: Store,
    private readonly _ts: TranslateService
  ) {}

  ngOnInit(): void {
    console.log('julien', this);
    this.projectUuid = ProjectService.IriToUuid(this.project.id);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  trackByFn = (index: number, item: ReadUser) => `${index}-${item.id}`;

  createUser() {
    const dialogRef = this._matDialog.open(CreateUserDialogComponent, DspDialogConfig.dialogDrawerConfig({}, true));
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.refreshParent.emit();
      });
  }

  sortList(key: UserSortKey) {
    this.sortBy = key;
    this.list = this._sortingService.keySortByAlphabetical(this.list, this.sortBy);
    localStorage.setItem('sortUsersBy', key);
  }
}
