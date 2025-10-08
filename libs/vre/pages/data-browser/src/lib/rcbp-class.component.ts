import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MultipleViewerService } from './comparison/multiple-viewer.service';
import { AbTestService } from './resource-class-sidenav/ab-test.service';
import { map } from 'rxjs';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-rcbp-class',
  template: `
    @if (abtestService.resourceClasSelected; as classSelected) {
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
  data$ = this._route.params.pipe(map(params => this._dspApiConnection.v2.onto.))
  constructor(
    public multipleViewerService: MultipleViewerService,
    public abtestService: AbTestService,
    private _route: ActivatedRoute,
    @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
  ) {}
}
