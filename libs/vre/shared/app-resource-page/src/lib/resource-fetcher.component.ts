import { ChangeDetectorRef, Component, Inject, Input, OnChanges } from '@angular/core';
import {
  Constants,
  KnoraApiConnection,
  ReadLinkValue,
  ReadResource,
  SystemPropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { Common, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resource-fetcher',
  template: ' <app-resource *ngIf="resource" [resource]="resource"></app-resource>',
})
export class ResourceFetcherComponent implements OnChanges {
  @Input({ required: true }) resourceIri!: string;

  resource: DspResource | undefined;

  constructor(
    private _cdr: ChangeDetectorRef,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  ngOnChanges() {
    this._getResource(this.resourceIri).subscribe(resource => {
      if (resource === null) {
        return;
      }

      if (resource.res.isDeleted) {
        return;
      }

      if (resource.isRegion) {
        this._renderAsRegion(resource);
        return;
      }

      this.resource = resource;
      this._cdr.detectChanges();
    });
  }

  private _renderAsRegion(region: DspResource) {
    const annotatedRepresentationIri = (region.res.properties[Constants.IsRegionOfValue] as ReadLinkValue[])[0]
      .linkedResourceIri;

    this._getResource(annotatedRepresentationIri).subscribe(dspResource => {
      this.resource = dspResource;
    });
  }

  private _getResource(resourceIri: string) {
    return this._dspApiConnection.v2.res.getResource(resourceIri).pipe(
      map(response => {
        const res = new DspResource(response as ReadResource);
        res.resProps = Common.initProps(res.res);

        // gather system property information
        res.systemProps = res.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);
        return res;
      })
    );
  }
}
