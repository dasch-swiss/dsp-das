import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReadOntology, ReadProject } from '@dasch-swiss/dsp-js';
import { getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/3rd-party-services/api';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { OntologiesSelectors, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import {
  ComponentCommunicationEventService,
  Events,
  ProjectService,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ProjectBase } from '../project-base';

type AvailableRoute =
  | typeof RouteConstants.project
  | typeof RouteConstants.settings
  | typeof RouteConstants.dataModels
  | typeof RouteConstants.advancedSearch;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent extends ProjectBase implements OnInit, OnDestroy {
  destroyed: Subject<void> = new Subject<void>();

  @ViewChild('sidenav') sidenav: MatSidenav;

  routeConstants = RouteConstants;

  listItemSelected = '';

  getAllEntityDefinitionsAsArray = getAllEntityDefinitionsAsArray;
  componentCommsSubscription: Subscription;
  sideNavOpened = true;

  // routes for sidenav
  settingsRoute: AvailableRoute = RouteConstants.settings;
  dataModelsRoute: AvailableRoute = RouteConstants.dataModels;

  isMember$: Observable<boolean> = combineLatest([this.user$, this.userProjectAdminGroups$]).pipe(
    map(([user, userProjectAdminGroups]) =>
      ProjectService.IsProjectMember(user, userProjectAdminGroups, this.projectUuid)
    )
  );

  projectOntologies$: Observable<ReadOntology[]> = combineLatest([
    this.isProjectsLoading$,
    this._store.select(OntologiesSelectors.isLoading),
    this._store.select(OntologiesSelectors.projectOntologies),
  ]).pipe(
    map(([isProjectsLoading, isOntologiesLoading, ontologies]) => {
      const projectIri = this._projectService.uuidToIri(this.projectUuid);
      if (!ontologies || !ontologies[projectIri]) {
        return [];
      }

      return ontologies[projectIri].readOntologies;
    })
  );

  @Select(OntologiesSelectors.hasLoadingErrors) hasLoadingErrors$: Observable<boolean>;
  @Select(ProjectsSelectors.currentProject) currentProject$: Observable<ReadProject>;

  constructor(
    private _componentCommsService: ComponentCommunicationEventService,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions,
    protected _router: Router,
    protected _store: Store,
    protected _route: ActivatedRoute,
    _titleService: Title,
    _projectService: ProjectService
  ) {
    super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
  }

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
    super.ngOnInit();
    this._router.events
      .pipe(
        takeUntil(this.destroyed),
        filter((e): e is NavigationEnd => e instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {
        this.listItemSelected = ProjectComponent.GetListItemSelected(event.url, this.projectUuid);
      });

    this.listItemSelected = ProjectComponent.GetListItemSelected(this._router.url, this.projectUuid);

    this.componentCommsSubscription = this._componentCommsService.on([Events.unselectedListItem], () => {
      this.listItemSelected = '';
    });
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

  static GetListItemSelected(url: string, projectUuid: string): string {
    switch (true) {
      case url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.advancedSearch}`): {
        return RouteConstants.advancedSearch;
      }
      case url === `/${RouteConstants.project}/${projectUuid}`: {
        return RouteConstants.project;
      }
      case url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.dataModels}`) ||
        url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.ontology}`) ||
        url.startsWith(`/${RouteConstants.project}/${projectUuid}/${RouteConstants.addList}`) ||
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
