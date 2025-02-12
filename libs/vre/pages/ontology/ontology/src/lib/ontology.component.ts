import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReadOntology, ReadProject, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  ClearCurrentOntologyAction,
  OntologiesSelectors,
  ProjectsSelectors,
  SetCurrentOntologyAction,
  SetCurrentProjectOntologyPropertiesAction,
} from '@dasch-swiss/vre/core/state';
import {
  DefaultClass,
  DefaultProperties,
  DefaultProperty,
  DefaultResourceClasses,
  ProjectService,
  PropertyCategory,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { OntologyEditService } from './services/ontology-edit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ontology',
  templateUrl: './ontology.component.html',
  styleUrls: ['./ontology.component.scss'],
})
export class OntologyComponent implements OnInit, OnDestroy {
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isAdmin$: Observable<boolean>;
  @Select(OntologiesSelectors.currentOntologyCanBeDeleted) currentOntologyCanBeDeleted$: Observable<boolean>;
  @Select(OntologiesSelectors.isLoading) isOntologiesLoading$: Observable<boolean>;
  @Select(ProjectsSelectors.currentProject) project$: Observable<ReadProject>;
  @Select(OntologiesSelectors.projectOntology) ontology$: Observable<ReadOntology>;

  // all resource classes in the current ontology
  ontoClasses: ResourceClassDefinitionWithAllLanguages[];
  // expand the resource class cards
  expandClasses = true;

  view: 'classes' | 'properties' = 'classes';

  /**
   * list of all default resource classes (subclass of)
   */
  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  destroyed: Subject<void> = new Subject<void>();

  // disable content on small devices
  disableContent = false;

  lastModificationDate$ = this._store
    .select(OntologiesSelectors.currentOntology)
    .pipe(map(x => x?.lastModificationDate));

  isLoading$ = combineLatest([
    this._store.select(OntologiesSelectors.isOntologiesLoading),
    this._store.select(OntologiesSelectors.isLoading),
    this._store.select(ProjectsSelectors.isProjectsLoading),
  ]).pipe(
    map(
      ([isOntologiesLoading, isLoading, isProjectsLoading]) =>
        isOntologiesLoading === true || isLoading === true || isProjectsLoading === true
    )
  );

  trackByPropCategoryFn = (index: number, item: PropertyCategory) => `${index}-${item.group}`;
  trackByDefaultPropertyFn = (index: number, item: DefaultProperty) => `${index}-${item.label}`;
  trackByDefaultClassFn = (index: number, item: DefaultClass) => `${index}-${item.iri}`;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _store: Store,
    private _titleService: Title,
    private _cd: ChangeDetectorRef,
    private _oes: OntologyEditService
  ) {}

  @HostListener('window:resize', ['$event']) onWindowResize() {
    this.disableContent = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.disableContent = window.innerWidth <= 768;
    this.view = this._route.snapshot.params['view'] ? this._route.snapshot.params['view'] : RouteConstants.classes;
    this.setPageTitleSync();
    this._cd.markForCheck();

    this.ontology$.pipe(takeUntil(this.destroyed)).subscribe(onto => {
      if (onto) {
        // Todo Store: Can't that the store trigger? What is the difference between OntologiesSelectors.projectOntology and OntologiesSelectors.currentOntology???!?
        this._store.dispatch(new SetCurrentOntologyAction(onto));
      }
    });

    this.isLoading$.pipe(takeUntil(this.destroyed)).subscribe(isLoading => {
      // Todo Store: Can't that the store trigger?
      const currentProject = this._store.selectSnapshot(ProjectsSelectors.currentProject);
      if (!isLoading && currentProject) {
        this._store.dispatch(new SetCurrentProjectOntologyPropertiesAction(currentProject.id));
      }
    });
  }

  private setPageTitleSync() {
    combineLatest([OntologyComponent.navigationEndFilter(this._router.events), this.project$, this.ontology$])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([event, project, currentOntology]) => {
        this._titleService.setTitle(`Project ${project?.shortname} | Data model${currentOntology ? '' : 's'}`);
      });
  }

  activateView(view: 'classes' | 'properties'): void {
    this._router.navigate([RouteConstants.ontology, this._route.snapshot.params['onto'], 'editor', view], {
      relativeTo: this._route.parent,
    });
    this.view = view;
  }

  createResourceClass(resClassInfo: DefaultClass): void {
    this._oes.createResourceClass(resClassInfo);
  }

  addNewProperty(propType: DefaultProperty) {
    this._oes.openAddNewProperty(propType);
  }

  editOntology(iri: string) {
    this._oes.openOntologyForm(iri);
  }

  deleteOntology() {
    this._oes.deleteCurrentOntology();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    this._store.dispatch(new ClearCurrentOntologyAction());
  }

  protected static navigationEndFilter(event: Observable<any>) {
    return event.pipe(
      filter(e => e instanceof NavigationEnd),
      filter(e => !(e as NavigationEnd).url.startsWith('api'))
    );
  }
}
