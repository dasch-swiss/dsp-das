/* eslint-disable @typescript-eslint/member-ordering */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Constants,
  CountQueryResponse,
  IHasPropertyWithPropertyDefinition,
  KnoraApiConnection,
  ReadResource,
  ReadResourceSequence,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SplitSize } from '../results/results.component';
import { DspResource } from './dsp-resource';
import { PropertyInfoValues } from './properties/properties.component';
import { StillImageComponent } from './representation/still-image/still-image.component';
import { IncomingService } from './services/incoming.service';
import { ResourceService } from './services/resource.service';
import { ValueOperationEventService } from './services/value-operation-event.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  providers: [ValueOperationEventService], // provide service on the component level so that each implementation of this component has its own instance.
})
export class ResourceComponent implements OnChanges, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @ViewChild('stillImage') stillImageComponent: StillImageComponent;

  @Input() resourceIri: string;

  @Input() splitSizeChanged: SplitSize;

  stillImageRepresentationsAsPartOfSequenceCount$: Observable<number>;

  oldResourceIri: string; // for change detection

  resourceUuid: string;

  resource: DspResource;

  // in case of incoming representations,
  // this will be the currently selected (part-of main) resource
  incomingResource: DspResource;

  selectedRegion: string;

  selectedTab = 0;

  incomingRegionsSub: Subscription;

  loading = true;

  refresh: boolean;

  navigationSubscription: Subscription;

  showRestrictedMessage = true;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService,
    private _resourceService: ResourceService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _titleService: Title,
    private _cdr: ChangeDetectorRef
  ) {
    this._route.params.subscribe(params => {
      this.resourceUuid = params.resource;
      if (params.project && this.resourceUuid) {
        this.resourceIri = this._resourceService.getResourceIri(params.project, this.resourceUuid);
        this.initResource(this.resourceIri);
      }
    });

    this._router.events.subscribe(event => {
      this._titleService.setTitle('Resource view');
    });
  }

  ngOnChanges() {
    this.initResource(this.resourceIri);
  }

  initResource(iri: string) {
    if (!iri || this.oldResourceIri === iri) {
      return;
    }
    this.stillImageRepresentationsAsPartOfSequenceCount$ = this.getStillImageRepresentationsAsPartOfSequenceCount$(iri);
    this.getResource(iri).subscribe(dspResource => {
      this.resource = dspResource;
      this.loading = false;
      this.oldResourceIri = this.resource.id;
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

  representationLoaded(e: boolean) {
    // this.loading = !e;
    // this._cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.navigationSubscription !== undefined) {
      this.navigationSubscription.unsubscribe();
    }

    if (this.incomingRegionsSub) {
      this.incomingRegionsSub.unsubscribe();
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
