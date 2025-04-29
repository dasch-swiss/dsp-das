import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
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
import { OntologyEditService } from '../services/ontology-edit.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ontology-editor-sidenav',
  templateUrl: './ontology-editor-sidenav.component.html',
  styleUrls: ['./ontology-editor-sidenav.component.scss'],
})
export class OntologyEditorSidenavComponent {
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  project$ = this._store.select(ProjectsSelectors.currentProject);

  readonly defaultClasses: DefaultClass[] = DefaultResourceClasses.data;
  readonly defaultProperties: PropertyCategory[] = DefaultProperties.data;

  expandClasses = true;
  @Input() view: 'classes' | 'properties' = 'classes';
  @Output() viewChange = new EventEmitter<'classes' | 'properties'>();

  constructor(
    private _oes: OntologyEditService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store
  ) {}

  activateView(view: 'classes' | 'properties'): void {
    this._router.navigate([RouteConstants.ontology, this._route.snapshot.params['onto'], 'editor', view], {
      relativeTo: this._route.parent,
    });
    this.view = view;
    this.viewChange.emit(this.view);
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
}
