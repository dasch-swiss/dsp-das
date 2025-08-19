import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { LoadProjectOntologiesAction, LoadProjectsAction, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { distinctUntilChanged, filter, map, Observable, startWith, Subject, take, takeUntil, takeWhile } from 'rxjs';
import { ProjectPageService } from './project-page.service';

@Component({
  selector: 'app-project-page',
  template: `
    <mat-sidenav-container style="flex: 1" autosize>
      <mat-sidenav mode="side" [(opened)]="sideNavOpened" [disableClose]="true" style="overflow: visible">
        <app-project-sidenav-collapse-button
          *ngIf="sideNavOpened"
          [expand]="false"
          (toggleSidenav)="toggleSidenav()"
          style="position: absolute; right: -11px; top: 21px" />
        <app-project-sidenav />
      </mat-sidenav>
      <mat-sidenav-content>
        <app-project-sidenav-collapse-button
          *ngIf="!sideNavOpened"
          [expand]="true"
          (toggleSidenav)="toggleSidenav()"
          style="position: absolute; top: 21px; left: 8px" />

        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styleUrls: ['./project-page.component.scss'],
  providers: [ProjectPageService],
})
export class ProjectPageComponent implements OnInit, OnDestroy {
  projectUuid$: Observable<string> = this._route.params.pipe(map(params => params[RouteConstants.uuidParameter]));
  isProjectsLoading$ = this._store.select(ProjectsSelectors.isProjectsLoading);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  sideNavOpened = true;
  currentOntologyName: undefined | string;

  destroyed: Subject<void> = new Subject<void>();

  protected readonly RouteConstants = RouteConstants;

  constructor(
    protected _actions$: Actions,
    private _router: Router,
    protected _store: Store,
    protected _route: ActivatedRoute,
    private _titleService: Title,
    protected projectService: ProjectService,
    private _projectPageService: ProjectPageService
  ) {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const element = event.target as HTMLElement;
    if (event.key === '[' && !element.matches('input, textarea')) {
      this.toggleSidenav();
    }
  }

  ngOnInit() {
    this._route.params.subscribe(params => {
      this._projectPageService.setCurrentProject(this.projectService.uuidToIri(params[RouteConstants.uuidParameter]));
    });

    this._router.events
      .pipe(
        takeUntil(this.destroyed),
        filter(e => e instanceof NavigationEnd),
        startWith(null)
      )
      .subscribe(() => {
        this.currentOntologyName = this.getParamFromRouteTree('onto');
      });

    this.projectUuid$.pipe(distinctUntilChanged(), takeUntil(this.destroyed)).subscribe(uuid => {
      this._loadProject(uuid);
    });

    this._store
      .select(ProjectsSelectors.currentProject)
      .pipe(distinctUntilChanged(), takeUntil(this.destroyed))
      .subscribe(project => {
        if (project) {
          this._titleService.setTitle(project.shortname);
        }
      });
  }

  private getParamFromRouteTree(param: string): string | undefined {
    let route = this._router.routerState.root;
    while (route) {
      if (route.snapshot.paramMap.has(param)) {
        return route.snapshot.paramMap.get(param) || undefined;
      }
      route = route.firstChild!;
    }
    return undefined;
  }

  private _loadProject(projectUuid: string): void {
    this.isProjectsLoading$
      .pipe(takeWhile(isLoading => !isLoading && !!projectUuid))
      .pipe(take(1))
      .subscribe({
        next: () => {
          const project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
          const projectIri = this.projectService.uuidToIri(projectUuid);
          if (!project || project.id !== projectIri) {
            // get current project data, project members and project groups
            // and set the project state here
            this._actions$
              .pipe(ofActionSuccessful(LoadProjectsAction))
              .pipe(take(1))
              .subscribe(() => this.setProjectData());
            this._store.dispatch([new LoadProjectsAction()]);
          } else {
            this._store.dispatch(new LoadProjectOntologiesAction(projectUuid));
          }
        },
      });
  }

  private setProjectData(): void {
    const project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
    if (!project) {
      return;
    }

    this._titleService.setTitle(project.shortname);
    this._store.dispatch(new LoadProjectOntologiesAction(project.id, this.currentOntologyName));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  toggleSidenav() {
    this.sideNavOpened = !this.sideNavOpened;
  }
}
