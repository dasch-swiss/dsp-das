import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KnoraApiConnection, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { combineLatest, first, map } from 'rxjs';
import { MultipleViewerService } from './comparison/multiple-viewer.service';

@Component({
  selector: 'app-rcbp-class',
  template: `
    @if (data$ | async; as classSelected) {
      @if (dataIsNotFound) {
        <app-centered-box>
          <app-no-results-found [message]="'There are no data corresponding to your request.'" />
        </app-centered-box>
      } @else {
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
    } @else {
      <app-progress-indicator />
    }
  `,
  standalone: false,
})
export class RcbpClassComponent {
  dataIsNotFound = false;
  data$ = combineLatest([
    this._route.params,
    this._projectPageService.currentProject$.pipe(first()),
    this._projectPageService.ontologies$,
  ]).pipe(
    map(([params, project, ontologies]) => {
      this.dataIsNotFound = false;
      const ontologyLabel = params['ontologyLabel'] as string;
      const classLabel = params['classLabel'] as string;

      const ontology = ontologies.find(ontology => ontology.label === ontologyLabel);
      if (!ontology) {
        this.dataIsNotFound = true;
        return;
      }

      const classId = this._getClassIdFromParams(project.shortcode, ontologyLabel, classLabel);

      const resClass = Object.values(ontology.classes).find(cls => cls.id === classId);
      if (!resClass) {
        this.dataIsNotFound = true;
      }

      return { ontologyLabel, classLabel, ontology, resClass: resClass as ResourceClassDefinitionWithAllLanguages };
    })
  );
  constructor(
    public multipleViewerService: MultipleViewerService,
    private _projectPageService: ProjectPageService,
    private _route: ActivatedRoute,
    private _ontologyService: OntologyService,
    @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection
  ) {}

  private _getClassIdFromParams(projectShortcode: string, ontologyLabel: string, classLabel: string) {
    const ontoId = `${this._ontologyService.getIriBaseUrl()}/ontology/${projectShortcode}/${ontologyLabel}/v2`;
    return `${ontoId}#${classLabel}`;
  }
}
