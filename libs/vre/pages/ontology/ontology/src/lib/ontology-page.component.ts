import { ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
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
import { EditPropertyFormDialogComponent } from './forms/property-form/edit-property-form-dialog.component';
import { CreatePropertyDialogData } from './forms/property-form/property-form.type';
import { EditResourceClassDialogComponent } from './forms/resource-class-form/edit-resource-class-dialog.component';
import { OntologyEditService } from './services/ontology-edit.service';

@Component({
  selector: 'app-ontology',
  templateUrl: './ontology-page.component.html',
  styleUrls: ['./ontology-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OntologyPageComponent implements OnInit, OnDestroy {
  project$ = this._store.select(ProjectsSelectors.currentProject);
  ontology$ = this._oes.currentOntology$;
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  disableContent = false;

  isTransacting$ = this._oes.isTransacting$;

  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  private _destroy = new Subject<void>();

  constructor(
    private _dialog: MatDialog,
    private _route: ActivatedRoute,
    private _store: Store,
    private _titleService: Title,
    private _oes: OntologyEditService
  ) {}

  expandClasses = true;

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

  openCreateResourceClass(defaultClass: DefaultClass) {
    this._dialog.open<EditResourceClassDialogComponent, DefaultClass>(
      EditResourceClassDialogComponent,
      DspDialogConfig.dialogDrawerConfig(defaultClass)
    );
  }

  openCreateNewProperty(propType: DefaultProperty) {
    this._dialog.open<EditPropertyFormDialogComponent, CreatePropertyDialogData>(EditPropertyFormDialogComponent, {
      data: { propType },
    });
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
