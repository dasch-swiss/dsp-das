import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { LoadProjectAction, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import {
  DefaultClass,
  DefaultProperties,
  DefaultProperty,
  DefaultResourceClasses,
  PropertyCategory,
} from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  view: 'classes' | 'properties' = 'classes';

  destroyed: Subject<void> = new Subject<void>();

  // disable content on small devices
  disableContent = false;

  isTransacting$ = this._oes.isTransacting$;

  constructor(
    private _route: ActivatedRoute,
    private _store: Store,
    private _titleService: Title,
    private _oes: OntologyEditService
  ) {}

  @HostListener('window:resize', ['$event']) onWindowResize() {
    this.disableContent = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.setPageProps();

    const ontoLabel = this._route.snapshot.params[RouteConstants.ontoParameter];
    const projectUuid = this._route.snapshot.params[RouteConstants.uuidParameter];

    this.project$.pipe(takeUntil(this.destroyed)).subscribe(project => {
      if (!project) {
        return;
      }
      this._oes.initOntologyByLabel(ontoLabel);
    });

    this._store.dispatch(new LoadProjectAction(projectUuid));
  }

  private setPageProps() {
    this.disableContent = window.innerWidth <= 768;
    this.view = this._route.snapshot.params['view'] ? this._route.snapshot.params['view'] : RouteConstants.classes;

    combineLatest([this.project$, this.ontology$])
      .pipe(takeUntil(this.destroyed))
      .subscribe(([project, currentOntology]) => {
        this._titleService.setTitle(`Project ${project?.shortname} | Data model${currentOntology ? '' : 's'}`);
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
