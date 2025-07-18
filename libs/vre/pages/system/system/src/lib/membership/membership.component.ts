import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
} from '@angular/core';
import { Constants, ReadUser, StoredProject } from '@dasch-swiss/dsp-js';
import { PermissionsData } from '@dasch-swiss/dsp-js/src/models/admin/permissions-data';
import { AdminUsersApiService, Project } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { LoadProjectsAction, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { AutocompleteItem } from '@dasch-swiss/vre/pages/user-settings/user';
import { Store } from '@ngxs/store';
import { BehaviorSubject, map, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-membership',
  template: `
    <div class="mat-headline-6 mb-2">
      This user is member of {{ ((userProjects$ | async) || []).length | i18nPlural: itemPluralMapping['project'] }}
    </div>

    <div *ngFor="let project of userProjects$ | async" class="align-center">
      <div class="flex-1">
        <div>{{ project.longname }} ({{ project.shortname }})</div>
        <div>
          @if (isUserProjectAdmin(user.permissions, project)) {
            User is <strong>Project admin</strong>
          }
        </div>
      </div>

      <button
        mat-icon-button
        color="warn"
        (click)="removeFromProject(project)"
        aria-label="Button to remove user from project"
        matTooltip="Remove user from project"
        matTooltipPosition="above">
        <mat-icon>delete_outline</mat-icon>
      </button>
    </div>

    <mat-divider class="my-2" />

    <div class="d-flex">
      <mat-form-field class="flex-1 mr-2">
        <mat-select placeholder="Add user to project" [(value)]="selectedValue">
          <mat-option *ngFor="let project of projects$ | async" [value]="project?.iri">
            {{ project?.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <button
        mat-icon-button
        color="primary"
        (click)="addToProject(selectedValue!)"
        [disabled]="selectedValue === null"
        aria-label="Button to add user to project"
        matTooltip="Add user to selected project"
        matTooltipPosition="above">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styleUrls: ['./membership.component.scss'],
})
export class MembershipComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input({ required: true }) user!: ReadUser;
  @Output() closeDialog = new EventEmitter<any>();

  private _ngUnsubscribe = new Subject<void>();
  selectedValue: string | null = null;

  userProjects$!: Observable<Project[]>;
  private _refreshSubject = new BehaviorSubject<null>(null);

  projects$!: Observable<AutocompleteItem[]>;

  readonly itemPluralMapping = {
    project: {
      '=1': '1 project',
      other: '# projects',
    },
  };

  constructor(
    private _store: Store,
    private _adminUsersApi: AdminUsersApiService
  ) {}

  ngAfterViewInit() {
    this._store.dispatch(new LoadProjectsAction());
  }

  ngOnChanges() {
    this.projects$ = this._store.select(ProjectsSelectors.allProjects).pipe(
      map(projects => this._getProjects(projects, this.user)),
      takeUntil(this._ngUnsubscribe)
    );
    this.userProjects$ = this._refreshSubject.pipe(
      switchMap(() => this._adminUsersApi.getAdminUsersIriUseririProjectMemberships(this.user.id)),
      map(response => response.projects || []),
      tap(v => {
        console.log('a', v);
      })
    );
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  removeFromProject(project: Project) {
    this._adminUsersApi
      .deleteAdminUsersIriUseririProjectMembershipsProjectiri(this.user.id, project.id as unknown as string)
      .subscribe(() => {
        this._refreshUserProjects();
      });
  }

  addToProject(projectIri: string) {
    this._adminUsersApi.postAdminUsersIriUseririProjectMembershipsProjectiri(this.user.id, projectIri).subscribe(() => {
      this._refreshUserProjects();
    });
  }

  isUserProjectAdmin(permissions: PermissionsData, project: Project): boolean {
    const projectIri = project.id as unknown as string;

    if (!permissions.groupsPerProject) return false;

    return permissions.groupsPerProject[projectIri].includes(Constants.ProjectAdminGroupIRI);
  }

  private _refreshUserProjects() {
    this._refreshSubject.next(null);
  }

  private _getProjects(projects: StoredProject[], user: ReadUser): AutocompleteItem[] {
    return projects
      .filter(
        p =>
          p.status &&
          p.id !== Constants.SystemProjectIRI &&
          p.id !== Constants.DefaultSharedOntologyIRI &&
          user.projects.every(userProject => userProject.id !== p.id)
      )
      .map(p => ({
        iri: p.id,
        name: `${p.longname} (${p.shortname})`,
      }))
      .sort((a: AutocompleteItem, b: AutocompleteItem) => a.name.localeCompare(b.name));
  }
}
