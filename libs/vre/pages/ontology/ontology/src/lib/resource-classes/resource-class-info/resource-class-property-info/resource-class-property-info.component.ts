import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Constants, ListNodeInfo, ReadOntology, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { ListsFacade, ListsSelectors, OntologiesSelectors, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService, PropertyInfoObject } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-class-property-info',
  templateUrl: './resource-class-property-info.component.html',
  styleUrls: ['./resource-class-property-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceClassPropertyInfoComponent {
  @Input({ required: true }) property!: PropertyInfoObject;

  get listUrl() {
    const re = /\<([^)]+)\>/;
    const match = this.property.propDef!.guiAttributes[0]?.match(re);
    const listIri = match?.[1]?.length ? match[1] : '';
    const projectUuid = this._store.selectSnapshot(ProjectsSelectors.currentProjectsUuid);
    return listIri && projectUuid ? `/project/${projectUuid}/list/${listIri.split('/').pop()}` : null;
  }

  constructor(
    private _lists: ListsFacade,
    private _ontoService: OntologyService,
    private _store: Store
  ) {}
}
