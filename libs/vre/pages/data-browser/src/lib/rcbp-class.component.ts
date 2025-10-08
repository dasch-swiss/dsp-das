import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnoraApiConnection, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { combineLatest, map } from 'rxjs';
import { MultipleViewerService } from './comparison/multiple-viewer.service';
import { AbTestService } from './resource-class-sidenav/ab-test.service';

@Component({
  selector: 'app-rcbp-class',
  template: `
    @if (data$ | async; as classSelected) {
      <as-split>
        <as-split-area [size]="34" cdkScrollable>
          <app-resource-class-panel [classSelected]="classSelected" />
        </as-split-area>
        <as-split-area [size]="66">
          @if (multipleViewerService.selectMode) {
            <app-resource-list-selection />
          }
          <app-multiple-viewer />
        </as-split-area>
      </as-split>
    }
  `,
  standalone: false,
})
export class RcbpClassComponent {
  data$ = combineLatest([this._route.params, this._projectPageService.ontologies$]).pipe(
    map(([params, ontologies]) => {
      console.log(params, ontologies);
      const ontologyLabel = params['ontologyLabel'] as string;
      const classLabel = params['classLabel'] as string;

      const ontology = ontologies.find(ontology => ontology.label === ontologyLabel);
      if (!ontology) {
        throw new Error('TODO: guard');
      }
      const resClass = Object.values(ontology.classes).find(cls => cls.label === classLabel);
      if (!resClass) {
        throw new Error('TODO: guard');
      }
      return { ontologyLabel, classLabel, ontology, resClass: resClass as ResourceClassDefinitionWithAllLanguages };
    })
  );
  constructor(
    public multipleViewerService: MultipleViewerService,
    public abtestService: AbTestService,
    private _projectPageService: ProjectPageService,
    private _route: ActivatedRoute,
    @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection
  ) {}
}
