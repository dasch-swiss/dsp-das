import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import {
  DefaultClass,
  DefaultProperties,
  DefaultProperty,
  DefaultResourceClasses,
  PropertyCategory,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { OntologyEditService } from './services/ontology-edit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ontology',
  templateUrl: './ontology.component.html',
  styleUrls: ['./ontology.component.scss'],
})
export class OntologyComponent implements OnInit, OnDestroy {
  project$ = this._store.select(ProjectsSelectors.currentProject);
  ontology$ = this._oes.currentOntology$;
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  disableContent = false;

  isTransacting$ = this._oes.isTransacting$;

  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  private _destroy = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    public router: Router,
    private _store: Store,
    private _titleService: Title,
    private _oes: OntologyEditService
  ) {}

  @HostListener('window:resize', ['$event']) onWindowResize() {
    this.disableContent = window.innerWidth <= 768;
  }

  ngOnInit() {
    this._setupPage();

    this.project$.pipe(takeUntil(this._destroy)).subscribe(project => {
      if (!project) {
        return;
      }
      const ontoLabel = this._route.snapshot.params[RouteConstants.ontoParameter];
      this._oes.initOntologyByLabel(ontoLabel);
    });
  }

  private _setupPage() {
    this.disableContent = window.innerWidth <= 768;

    combineLatest([this.project$, this.ontology$])
      .pipe(take(1))
      .subscribe(([project, currentOntology]) => {
        this._titleService.setTitle(`Project ${project?.shortname} | Data model${currentOntology ? '' : 's'}`);
      });
  }

  createResourceClass(resClassInfo: DefaultClass): void {
    this._oes.createResourceClass(resClassInfo);
  }

  addNewProperty(propType: DefaultProperty) {
    this._oes.openAddNewProperty(propType);
  }

  trackByPropCategoryFn = (index: number, item: PropertyCategory) => `${index}-${item.group}`;
  trackByDefaultPropertyFn = (index: number, item: DefaultProperty) => `${index}-${item.label}`;
  trackByDefaultClassFn = (index: number, item: DefaultClass) => `${index}-${item.iri}`;

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this._oes.unloadOntology();
  }
}
