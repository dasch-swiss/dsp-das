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
import { AdminUsersApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { LoadProjectsAction, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { AutocompleteItem } from '@dasch-swiss/vre/pages/user-settings/user';
import { Store } from '@ngxs/store';
import { map, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-membership',
  template: `
    <div class="mat-headline-6 mb-2">
      This user is member of {{ user.projects.length | i18nPlural: itemPluralMapping['project'] }}
    </div>

    <div *ngFor="let project of user.projects" class="align-center">
      <div class="flex-1">
        <div>{{ project.longname }} ({{ project.shortname }})</div>
        <div>
          @if (isUserProjectAdmin(user.permissions, project.id)) {
            User is <strong>Project admin</strong>
          }
        </div>
      </div>

      <button
        mat-icon-button
        color="warn"
        (click)="removeFromProject(project.id)"
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
  private _ngUnsubscribe = new Subject<void>();

  selectedValue: string | null = null;

  @Input({ required: true }) user!: ReadUser;
  @Output() closeDialog = new EventEmitter<any>();

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
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  removeFromProject(projectIri: string) {
    this._adminUsersApi.deleteAdminUsersIriUseririProjectMembershipsProjectiri(this.user.id, projectIri);
  }

  addToProject(projectIri: string) {
    this._adminUsersApi.postAdminUsersIriUseririProjectMembershipsProjectiri(this.user.id, projectIri).subscribe();
  }

  isUserProjectAdmin(permissions: PermissionsData, projectIri: string): boolean {
    if (!permissions.groupsPerProject) return false;

    return permissions.groupsPerProject[projectIri].includes(Constants.ProjectAdminGroupIRI);
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
