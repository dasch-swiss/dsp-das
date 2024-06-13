import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { StringLiteral } from '@dasch-swiss/dsp-js/src/models/admin/string-literal';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil, takeWhile } from 'rxjs/operators';
import { AppGlobal } from '../../app-global';

@Component({
  // changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-description',
  template: `
    <dasch-swiss-app-progress-indicator *ngIf="isLoading$ | async"></dasch-swiss-app-progress-indicator>
    <div *ngIf="readProject$ | async as project" class="content large middle">
      <div>
        <p>Project Description</p>
      </div>
      <!--  mobile version: status and edit icon displayed before the title -->
      <div class="app-toolbar-mobile">
        <span class="app-toolbar-action-edit" *ngIf="userHasPermission$ | async">
          <button mat-icon-button *ngIf="project.status" class="right" color="primary">
            <mat-icon>edit_square</mat-icon>
            Edit project description
          </button>
        </span>
      </div>

      <!-- desktop and tablet version -->
      <div class="app-toolbar transparent more-space-bottom">
        <div class="app-toolbar-row">
          <h3 class="mat-body subtitle">Project {{ project.shortcode }} | {{ project.shortname | uppercase }}</h3>
          <span class="fill-remaining-space"></span>
          <span class="app-toolbar-action">
            <button
              mat-button
              *ngIf="(userHasPermission$ | async) && project.status"
              class="right"
              [routerLink]="RouteConstants.projectEditRelative"
              color="primary">
              <mat-icon>edit_square</mat-icon>
              Edit project description
            </button>
          </span>
        </div>
      </div>
      <!-- description -->
      <div class="description-rm">
        <div>
          <p class="project-longname">{{ project.longname }}</p>
        </div>
        <section class="project description" *ngFor="let desc of sortedDescriptions$ | async">
          <div [innerHtml]="desc.value"></div>
        </section>

        <mat-divider *ngIf="project.keywords.length > 0"></mat-divider>

        <!-- keywords -->
        <section class="project keywords">
          <mat-chip-listbox>
            <mat-chip *ngFor="let k of project.keywords">{{ k }}</mat-chip>
          </mat-chip-listbox>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent implements OnDestroy {
  destroyed$: Subject<void> = new Subject<void>();

  readProject$ = combineLatest([this._route.paramMap, this._store.select(ProjectsSelectors.allProjects)]).pipe(
    takeUntil(this.destroyed$),
    map(([params, allProjects]) => {
      const projects = allProjects.find(x => x.id.split('/').pop() === params.get(RouteConstants.uuidParameter));
      return projects;
    })
  );

  sortedDescriptions$ = this.readProject$.pipe(
    takeUntil(this.destroyed$),
    takeWhile(readProject => readProject !== undefined),
    map(({ description }) => this._sortDescriptionsByLanguage(description))
  );

  userHasPermission$ = combineLatest([
    this._store.select(UserSelectors.user),
    this.readProject$,
    this._store.select(UserSelectors.userProjectAdminGroups),
  ]).pipe(
    map(([user, readProject, userProjectGroups]) => {
      if (readProject == null) {
        return false;
      }

      return ProjectService.IsProjectAdminOrSysAdmin(user as ReadUser, userProjectGroups, readProject.id);
    })
  );

  RouteConstants = RouteConstants;

  @Select(ProjectsSelectors.isProjectsLoading) isLoading$: Observable<boolean>;

  constructor(
    private _route: ActivatedRoute,
    private _store: Store,
    private _projectService: ProjectService
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private _sortDescriptionsByLanguage(descriptions: StringLiteral[]): StringLiteral[] {
    const languageOrder = AppGlobal.languagesList.map(l => l.language);

    return descriptions.sort((a, b) => {
      const indexA = languageOrder.indexOf(a.language);
      const indexB = languageOrder.indexOf(b.language);

      return indexA - indexB;
    });
  }
}
