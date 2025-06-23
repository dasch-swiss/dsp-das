import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Constants, ListNodeInfo, ReadOntology, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { ListsSelectors, OntologiesSelectors, ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperty, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-class-property-info',
  templateUrl: './resource-class-property-info.component.html',
  styleUrls: ['./resource-class-property-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceClassPropertyInfoComponent implements OnChanges, OnInit, OnDestroy {
  @Input({ required: true }) propDef!: ResourcePropertyDefinitionWithAllLanguages;

  propAttribute?: string;
  propAttributeComment?: string;

  private _destroy = new Subject<void>();

  get propType(): DefaultProperty {
    return this._ontoService.getDefaultPropertyType(this.propDef);
  }

  get listUrl() {
    const re = /\<([^)]+)\>/;
    const match = this.propDef.guiAttributes[0]?.match(re);
    const listIri = match?.[1]?.length ? match[1] : '';
    const projectUuid = this._store.selectSnapshot(ProjectsSelectors.currentProjectsUuid);
    return listIri && projectUuid ? `/project/${projectUuid}/list/${listIri.split('/').pop()}` : null;
  }

  constructor(
    private _ontoService: OntologyService,
    private _store: Store
  ) {}

  ngOnChanges(): void {
    this._ontoService.getDefaultProperty(this.propDef);
  }

  ngOnInit() {
    if (this.propDef.isLinkProperty) {
      this._store
        .select(OntologiesSelectors.currentProjectOntologies)
        .pipe(
          takeUntil(this._destroy),
          filter(ontologies => !!ontologies && ontologies.length > 0)
        )
        .subscribe(ontologies => {
          this._setAttributesForLinkProperty(ontologies);
        });
    }

    if (this.propDef.objectType === Constants.ListValue) {
      this._store
        .select(ListsSelectors.listsInProject)
        .pipe(
          takeUntil(this._destroy),
          filter(lists => !!lists && lists.length > 0)
        )
        .subscribe(lists => {
          this._setAttributesForListProperty(lists);
        });
    }
  }

  private _setAttributesForListProperty(lists: ListNodeInfo[]) {
    const list = lists.find(i => i.id.split('/').pop() === this.listUrl?.split('/').pop());
    if (list) {
      this.propAttribute = `<a href="${this.listUrl}">${list.labels[0].value}</a>`;
      this.propAttributeComment = list.comments.length ? list.comments[0].value : undefined;
    }
  }

  private _setAttributesForLinkProperty(currentProjectOntologies: ReadOntology[]) {
    if (this.propDef.objectType === Constants.Region) {
      this.propAttribute = 'Region';
      return;
    }

    const propertiesBaseOntologyId = this.propDef.objectType?.split('#')[0];
    const baseOntology = currentProjectOntologies.find(i => i.id === propertiesBaseOntologyId);
    this.propAttribute = baseOntology?.classes[this.propDef.objectType!].label;
    this.propAttributeComment = baseOntology?.classes[this.propDef.objectType!].comment;
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
