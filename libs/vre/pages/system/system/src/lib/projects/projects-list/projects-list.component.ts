import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Constants, StoredProject } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { AppConfigService, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService, SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { SortProp } from '../../sort-button/sort-button.component';
import {
  EraseProjectDialogComponent,
  IEraseProjectDialogProps,
} from './erase-project-dialog/erase-project-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
})
export class ProjectsListComponent implements OnInit, OnDestroy {
  private _ngUnsubscribe = new Subject<void>();

  @Input({ required: true }) isUserActive!: boolean;
  @Input({ required: true }) projectsList!: StoredProject[];
  @Input() createNewButtonEnabled = false;
  @Input() isUsersProjects = false;
  @Output() refreshParent = new EventEmitter<void>();

  isLoading = false;
  allowEraseProject = this._appConfigService.dspFeatureFlagsConfig.allowEraseProjects;
  systemProjects: string[] = [Constants.SystemProjectIRI, Constants.DefaultSharedOntologyIRI];

  itemPluralMapping = {
    project: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': `1 ${this._translateService.instant('pages.system.projectsList.project')}`,
      other: `# ${this._translateService.instant('pages.system.projectsList.projects')}`,
    },
  };

  sortProps: SortProp[] = [
    {
      key: 'shortcode',
      label: this._translateService.instant('pages.system.projectsList.sortShortCode'),
    },
    {
      key: 'shortname',
      label: this._translateService.instant('pages.system.projectsList.sortShortName'),
    },
    {
      key: 'longname',
      label: this._translateService.instant('pages.system.projectsList.sortProjectName'),
    },
  ];

  sortBy = 'longname';

  user$ = this._store.select(UserSelectors.user);
  userProjectAdminGroups$ = this._store.select(UserSelectors.userProjectAdminGroups);
  isSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);
  allProjects$ = this._store.select(ProjectsSelectors.allProjects);
  isProjectsLoading$ = this._store.select(ProjectsSelectors.isProjectsLoading);

  constructor(
    private _appConfigService: AppConfigService,
    private _dialog: MatDialog,
    private _dialogService: DialogService,
    private _notification: NotificationService,
    private _projectApiService: ProjectApiService,
    private _router: Router,
    private _sortingService: SortingService,
    private _store: Store,
    private _translateService: TranslateService
  ) {}

  ngOnInit() {
    this.sortBy = localStorage.getItem('sortProjectsBy') || this.sortBy;
    this.sortList(this.sortBy);
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  trackByFn = (index: number, item: StoredProject) => `${index}-${item.id}`;

  userHasPermission$(projectIri: string): Observable<boolean> {
    return combineLatest([this.user$.pipe(filter(user => !!user)), this.userProjectAdminGroups$]).pipe(
      takeUntil(this._ngUnsubscribe),
      map(([user, userProjectGroups]) => ProjectService.IsProjectAdminOrSysAdmin(user, userProjectGroups, projectIri))
    );
  }

  userIsProjectAdmin$(projectIri: string): Observable<boolean> {
    return combineLatest([this.user$, this.userProjectAdminGroups$]).pipe(
      takeUntil(this._ngUnsubscribe),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      map(([_, userProjectGroups]) => ProjectService.IsInProjectGroup(userProjectGroups, projectIri))
    );
  }

  openProjectPage(iri: string) {
    const uuid = ProjectService.IriToUuid(iri);

    this._router
      .navigateByUrl(`/${RouteConstants.refresh}`, { skipLocationChange: true })
      .then(() => this._router.navigate([RouteConstants.project, uuid]));
  }

  createNewProject() {
    const queryParams = this.isUsersProjects ? { [RouteConstants.assignCurrentUser]: true } : {};
    this._router.navigate([RouteConstants.project, RouteConstants.createNew], { queryParams });
  }

  editProject(iri: string) {
    const uuid = ProjectService.IriToUuid(iri);
    this._router.navigate([RouteConstants.project, uuid, RouteConstants.settings, RouteConstants.edit]);
  }

  changeProjectStatus(name: string, id: string, activate: boolean) {
    const confirmationKey = activate
      ? 'pages.system.projectsList.reactivateConfirmation'
      : 'pages.system.projectsList.deactivateConfirmation';

    this._dialogService
      .afterConfirmation(this._translateService.instant(confirmationKey, { 0: name }))
      .pipe(
        switchMap(() =>
          activate ? this._projectApiService.update(id, { status: true }) : this._projectApiService.delete(id)
        )
      )
      .subscribe(() => {
        this.refreshParent.emit();
      });
  }

  eraseProject(project: StoredProject) {
    this._dialog
      .open<EraseProjectDialogComponent, IEraseProjectDialogProps>(EraseProjectDialogComponent, {
        data: <IEraseProjectDialogProps>{
          project,
        },
      })
      .afterClosed()
      .pipe(
        filter(response => !!response),
        take(1)
      )
      .subscribe((erasedProject: StoredProject) => {
        this.refreshParent.emit();
        this._notification.openSnackBar(
          this._translateService.instant('pages.system.projectsList.eraseConfirmation', {
            0: erasedProject.shortname,
          })
        );
      });
  }

  sortList(key: any) {
    if (!this.projectsList) {
      throw new Error('List is not defined.');
    }
    this.projectsList = this._sortingService.keySortByAlphabetical(this.projectsList, key);
    localStorage.setItem('sortProjectsBy', key);
  }
}
