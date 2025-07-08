import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReadOntology, ReadProject } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/3rd-party-services/api';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  LoadProjectOntologiesAction,
  LoadProjectsAction,
  OntologiesSelectors,
  ProjectsSelectors,
} from '@dasch-swiss/vre/core/state';
import {
  ComponentCommunicationEventService,
  Events,
  ProjectService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { combineLatest, Observable, of, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, take, takeUntil, takeWhile } from 'rxjs/operators';

type AvailableRoute =
  | typeof RouteConstants.project
  | typeof RouteConstants.settings
  | typeof RouteConstants.dataModels
  | typeof RouteConstants.advancedSearch;

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit, OnDestroy {
  destroyed: Subject<void> = new Subject<void>();

  @ViewChild('sidenav') sidenav: MatSidenav;

  routeConstants = RouteConstants;
  projectUuid = '';

  listItemSelected = '';

  getAllEntityDefinitionsAsArray = getAllEntityDefinitionsAsArray;
  componentCommsSubscription: Subscription;
  sideNavOpened = true;
  expandedOntologyId$: Observable<string>;

  // routes for sidenav
  settingsRoute: AvailableRoute = RouteConstants.settings;
  dataModelsRoute: AvailableRoute = RouteConstants.dataModels;

  projectOntologies$: Observable<ReadOntology[]> = this._store.select(OntologiesSelectors.projectOntologies).pipe(
    takeUntil(this.destroyed),
    map(ontologies => {
      const projectIri = this._store.selectSnapshot(ProjectsSelectors.currentProject)?.id;
      if (!projectIri || !ontologies || !ontologies[projectIri]) {
        return [];
      }
      return ontologies[projectIri].readOntologies;
    })
  );

  projectIri$: Observable<string>;

  @Select(ProjectsSelectors.currentProject) project$: Observable<ReadProject>;

  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
  @Select(OntologiesSelectors.hasLoadingErrors) hasLoadingErrors$: Observable<boolean>;
  @Select(ProjectsSelectors.currentProject) currentProject$: Observable<ReadProject>;

  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isAdmin$: Observable<boolean>;

  @Select(OntologiesSelectors.projectOntology) ontology$!: Observable<ReadOntology>;

  projectUuid$: Observable<string> = combineLatest([
    this._route.params,
    this._route.parent?.params,
    this._route.parent?.parent ? this._route.parent.parent.params : of({}),
  ]).pipe(
    takeUntil(this.destroyed),
    map(([params, parentParams, parentParentParams]) => {
      return params[RouteConstants.uuidParameter]
        ? params[RouteConstants.uuidParameter]
        : parentParams[RouteConstants.uuidParameter]
          ? parentParams[RouteConstants.uuidParameter]
          : parentParentParams[RouteConstants.uuidParameter];
    })
  );

  projectIriFromUrl$: Observable<string> = this.projectUuid$.pipe(map(uuid => this.projectService.uuidToIri(uuid)));

  constructor(
    private _componentCommsService: ComponentCommunicationEventService,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions,
    protected _router: Router,
    protected _store: Store,
    protected _route: ActivatedRoute,
    private _titleService: Title,
    protected projectService: ProjectService
  ) {}

  /**
   * add keyboard support to expand/collapse sidenav
   * @param event automatically passed whenever the user types
   */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    const element = event.target as HTMLElement;
    if (event.key === '[' && !element.matches('input, textarea')) {
      this.toggleSidenav();
    }
  }

  ngOnInit() {
    this._router.events
      .pipe(
        takeUntil(this.destroyed),
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.listItemSelected = ProjectComponent.GetListItemSelected(event.url);
      });

    this.listItemSelected = ProjectComponent.GetListItemSelected(this._router.url);

    this.componentCommsSubscription = this._componentCommsService.on([Events.unselectedListItem], () => {
      this.listItemSelected = '';
    });

    this.projectUuid$.pipe(distinctUntilChanged(), takeUntil(this.destroyed)).subscribe(uuid => {
      this.projectUuid = uuid;
      this._loadProject(uuid);
    });

    this.projectIri$ = combineLatest([this.project$, this.projectIriFromUrl$]).pipe(
      takeUntil(this.destroyed),
      distinctUntilChanged(),
      map(([project, projectIriFromUrl]) => {
        return project ? project.id : projectIriFromUrl;
      })
    );

    this.project$.pipe(distinctUntilChanged(), takeUntil(this.destroyed)).subscribe(project => {
      if (project) {
        this._titleService.setTitle(project.shortname);
      }
    });

    this.expandedOntologyId$ = this.ontology$.pipe(
      map(ontology => ontology?.id ?? '') // Extract ID or empty string if null
    );
  }

  private _loadProject(projectUuid: string): void {
    this.isProjectsLoading$
      .pipe(takeWhile(isLoading => isLoading === false && projectUuid !== undefined))
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
    this._store.dispatch(new LoadProjectOntologiesAction(project.id));
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  trackByFn = (index: number, item: ReadOntology) => `${index}-${item.id}`;

  open(route: AvailableRoute, id = '') {
    const routeCommands = id ? [route, id] : [route];
    const extras = route === RouteConstants.project ? {} : { relativeTo: this._route };
    this.listItemSelected = route;
    this._router.navigate(routeCommands, extras);
  }

  /**
   * given a Html element, compare the scrollHeight and the clientHeight
   *
   * @param elem the element which has the line-clamp css
   * @returns inverse of comparison between the scrollHeight and the clientHeight of elem
   */
  compareElementHeights(elem: HTMLElement): boolean {
    return !(elem.scrollHeight > elem.clientHeight);
  }

  /**
   * toggle sidenav
   */
  toggleSidenav() {
    this.sideNavOpened = !this.sideNavOpened;
    this.sidenav.toggle();
  }

  static GetListItemSelected(url: string, projectUuid = ''): string {
    switch (true) {
      case url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.advancedSearch}`): {
        return RouteConstants.advancedSearch;
      }
      case url === `/${RouteConstants.project}/${projectUuid}`: {
        return RouteConstants.project;
      }
      case url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.dataModels}`) ||
        url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.ontology}`) ||
        url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.list}`) ||
        url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.addOntology}`): {
        return RouteConstants.dataModels;
      }
      case url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.settings}`): {
        return RouteConstants.settings;
      }
    }
  }
}
