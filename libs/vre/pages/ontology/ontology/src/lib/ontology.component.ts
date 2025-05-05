import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { LoadProjectAction, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
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

  view: 'classes' | 'properties' = 'classes';

  expandAllClasses = true;

  disableContent = false;

  isTransacting$ = this._oes.isTransacting$;

  private _destroy = new Subject<void>();

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
    this._setupPage();

    this.project$.pipe(takeUntil(this._destroy)).subscribe(project => {
      if (!project) {
        return;
      }
      const ontoLabel = this._route.snapshot.params[RouteConstants.ontoParameter];
      this._oes.initOntologyByLabel(ontoLabel);
    });

    const projectUuid = this._route.snapshot.params[RouteConstants.uuidParameter];
    this._store.dispatch(new LoadProjectAction(projectUuid));
  }

  private _setupPage() {
    this.disableContent = window.innerWidth <= 768;
    this.view = this._route.snapshot.params['view'] ? this._route.snapshot.params['view'] : RouteConstants.classes;

    combineLatest([this.project$, this.ontology$])
      .pipe(take(1))
      .subscribe(([project, currentOntology]) => {
        this._titleService.setTitle(`Project ${project?.shortname} | Data model${currentOntology ? '' : 's'}`);
      });
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this._oes.unloadOntology();
  }
}
