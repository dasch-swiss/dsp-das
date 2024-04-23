import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CountQueryResponse, KnoraApiConnection, ReadResource } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SplitSize } from '../results/results.component';
import { DspResource } from './dsp-resource';
import { IncomingService } from './services/incoming.service';
import { ResourceService } from './services/resource.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
})
export class ResourceComponent implements OnChanges {
  @Input() resourceIri: string;

  @Input() splitSizeChanged: SplitSize;

  stillImageRepresentationsAsPartOfSequenceCount$: Observable<number>;

  resource: DspResource;

  loading = true;

  showRestrictedMessage = true;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService,
    private _resourceService: ResourceService,
    private _route: ActivatedRoute,
    private _titleService: Title,
    private _cdr: ChangeDetectorRef
  ) {
    this._route.params.subscribe(params => {
      if (params.project && params.resource) {
        this.resourceIri = this._resourceService.getResourceIri(params.project, params.resource);
        this.initResource(this.resourceIri);
      }
    });

    this._titleService.setTitle('Resource view');
  }

  ngOnChanges() {
    this.initResource(this.resourceIri);
  }

  initResource(iri: string) {
    this.stillImageRepresentationsAsPartOfSequenceCount$ = this.getStillImageRepresentationsAsPartOfSequenceCount$(iri);
    this.getResource(iri).subscribe(dspResource => {
      this.resource = dspResource;
      this.loading = false;
      this._cdr.markForCheck();
    });
  }

  getResource(iri: string): Observable<DspResource> {
    return this._dspApiConnection.v2.res
      .getResource(iri)
      .pipe(map((response: ReadResource) => new DspResource(response)));
  }

  getStillImageRepresentationsAsPartOfSequenceCount$(resourceId: string): Observable<number> {
    return this._incomingService.getStillImageRepresentationsForCompoundResource(resourceId, 0, true).pipe(
      map((countQuery: CountQueryResponse) => {
        return countQuery.numberOfResults;
      })
    );
  }
}
