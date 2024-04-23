/* eslint-disable @typescript-eslint/member-ordering */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Constants,
  CountQueryResponse,
  IHasPropertyWithPropertyDefinition,
  KnoraApiConnection,
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
  ReadLinkValue,
  ReadMovingImageFileValue,
  ReadResource,
  ReadResourceSequence,
  ReadStillImageFileValue,
  ReadTextFileValue,
  ReadUser,
  SystemPropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { SplitSize } from '../results/results.component';
import { DspCompoundPosition, DspResource } from './dsp-resource';
import { PropertyInfoValues } from './properties/properties.component';
import { FileRepresentation, RepresentationConstants } from './representation/file-representation';
import { Region, StillImageComponent } from './representation/still-image/still-image.component';
import { IncomingService } from './services/incoming.service';
import { ResourceService } from './services/resource.service';
import { Events, UpdatedFileEventValue, ValueOperationEventService } from './services/value-operation-event.service';

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

      if (!this.resource.readFileValueType) {
        this.requestIncomingResources(dspResource);
      }

      // gather resource property information
      this.resource.resProps = this.initProps(this.resource);
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

  /**
   * gather resource property information
   */
  protected initProps(resource: ReadResource): PropertyInfoValues[] {
    let props = resource.entityInfo.classes[resource.type]
      .getResourcePropertiesList()
      .map((prop: IHasPropertyWithPropertyDefinition) => {
        // the object type is none from above
        const propInfoAndValues = {
          propDef: prop.propertyDefinition,
          guiDef: prop,
          values: resource.getValues(prop.propertyIndex),
        };
        return propInfoAndValues;
      });

    // sort properties by guiOrder
    props = props
      .filter(prop => prop.propDef.objectType !== Constants.GeomValue)
      .sort((a, b) => (a.guiDef.guiOrder > b.guiDef.guiOrder ? 1 : -1))
      // to get equal results on all browser engines which implements sorting in different way
      // properties list has to be sorted again, pushing all "has..." properties to the bottom
      // TODO FOLLOWING LINE IS A BUG ARRAY-CALLBACK-RETURN SHOULDNT BE DISABLED
      // eslint-disable-next-line array-callback-return
      .sort(a => {
        if (a.guiDef.guiOrder === undefined) {
          return 1;
        }
      });

    return props;
  }

  /**
   * requests incoming resources for [[this.resource]].
   * Incoming resources are: regions, representations, and incoming links.
   */
  protected requestIncomingResources(resource: DspResource): void {
    // make sure that this resource has been initialized correctly
    if (resource === undefined) {
      return;
    }

    // check for incoming links for the current resource
    this.getIncomingLinks(0);
  }

  /**
   * gets the incoming regions for [[this.resource]].
   *
   * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
   */
  protected getIncomingRegions(resource: DspResource, offset: number): void {
    if (this.incomingRegionsSub) {
      this.incomingRegionsSub.unsubscribe();
    }
    this.incomingRegionsSub = this._incomingService
      .getIncomingRegions(resource.id, offset)
      .subscribe((regions: ReadResourceSequence) => {
        // append elements of regions.resources to resource.incoming
        Array.prototype.push.apply(resource.incomingAnnotations, regions.resources);

        // this.annotationResources.push(regions.resources)

        // prepare regions to be displayed
        // triggers ngOnChanges of StillImageComponent
        this._cdr.markForCheck();
      });
  }

  openRegion(iri: string) {
    // open annotation tab
    this.selectedTab = this.incomingResource ? 2 : 1;

    // activate the selected region
    this.selectedRegion = iri;

    // and scroll to region with this id
    const region = document.getElementById(iri);
    if (region) {
      region.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  /**
   * get resources pointing to [[this.resource]] with properties other than knora-api:isPartOf and knora-api:isRegionOf.
   *
   * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
   * It takes the number of images returned as an argument.
   */
  protected getIncomingLinks(offset: number): void {
    this._incomingService
      .getIncomingLinksForResource(this.resource?.id, offset)
      .subscribe((incomingResources: ReadResourceSequence) => {
        // Check if incomingReferences is initialized, if not, initialize it as an empty array
        if (!this.resource?.incomingReferences) {
          this.resource.incomingReferences = [];
        }
        // append elements incomingResources to this.resource.incomingLinks
        Array.prototype.push.apply(this.resource?.incomingReferences, incomingResources.resources);
      });
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
