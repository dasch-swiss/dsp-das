import { ChangeDetectorRef, Component, Inject, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  Constants,
  CountQueryResponse,
  KnoraApiConnection,
  ReadArchiveFileValue,
  ReadAudioFileValue,
  ReadDocumentFileValue,
  ReadMovingImageFileValue,
  ReadResource,
  ReadResourceSequence,
  ReadStillImageFileValue,
  ReadTextFileValue,
  SystemPropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { Common, DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { IncomingService } from '@dasch-swiss/vre/shared/app-resource-properties';
import { GetAttachedUserAction } from '@dasch-swiss/vre/shared/app-state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, Subscription } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { FileRepresentation } from './representation/file-representation';
import { Region, StillImageComponent } from './representation/still-image/still-image.component';
import { ValueOperationEventService } from './services/value-operation-event.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  providers: [ValueOperationEventService], // provide service on the component level so that each implementation of this component has its own instance.
})
export class ResourceComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) resource!: DspResource;
  @ViewChild('stillImage') stillImageComponent: StillImageComponent;
  @ViewChild('matTabAnnotations') matTabAnnotations;

  incomingResource: DspResource;
  annotationResources: DspResource[];
  selectedRegion: string;
  selectedTab = 0;
  selectedTabLabel: string;
  representationsToDisplay: FileRepresentation[] = [];
  compoundPosition: DspCompoundPosition;
  loading = false;
  valueOperationEventSubscriptions: Subscription[] = [];
  showRestrictedMessage = true;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _incomingService: IncomingService,
    private _notification: NotificationService,
    private _router: Router,
    private _titleService: Title,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _actions$: Actions
  ) {
    this._router.events.subscribe(() => {
      this._titleService.setTitle('Resource view');
    });
  }

  ngOnChanges() {
    this.incomingResource = undefined;
    this.compoundPosition = undefined;
    this.showRestrictedMessage = true;
    this._newMethod();
  }

  private _newMethod() {
    const resource = this.resource;
    if (resource.isRegion) {
      this._renderAsRegion(resource);
      return;
    }

    this._renderAsMainResource(resource);
  }

  ngOnDestroy() {
    this.valueOperationEventSubscriptions?.forEach(sub => sub.unsubscribe());

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  compoundNavigation(page: number) {
    this.selectedRegion = undefined;
    this.representationsToDisplay = [];

    // set current compound object position:
    // calculate offset and offset item position from current page and total pages info
    const offset = Math.ceil(page / 25) - 1;
    const position = Math.floor(page - offset * 25 - 1);

    // get incoming still image representations, if the offset changed
    if (offset !== this.compoundPosition.offset) {
      this.compoundPosition.offset = offset;
      this._getIncomingStillImageRepresentations(offset);
    } else {
      // get incoming resource, if the offset is the same but page changed
      this._getIncomingResource(this.resource.incomingRepresentations[position].id);
    }
    this.compoundPosition.position = position;
    this.compoundPosition.page = page;
    this.representationsToDisplay = this._collectRepresentationsAndAnnotations(this.incomingResource);
  }

  tabChanged(e: MatTabChangeEvent) {
    if (e.tab.textLabel === 'annotations') {
      this.stillImageComponent?.renderRegions();
    } else {
      this.stillImageComponent?.removeOverlays();
    }
    this.selectedTabLabel = e.tab.textLabel;
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
  private _getIncomingLinks(offset: number): void {
    this._incomingService
      .getIncomingLinksForResource(this.resource?.res.id, offset)
      .subscribe((incomingResources: ReadResourceSequence) => {
        // Check if incomingReferences is initialized, if not, initialize it as an empty array
        if (!this.resource?.res.incomingReferences) {
          this.resource.res.incomingReferences = [];
        }
        // append elements incomingResources to this.resource.incomingLinks
        Array.prototype.push.apply(this.resource?.res.incomingReferences, incomingResources.resources);
      });
  }

  /**
   * creates a collection of [[StillImageRepresentation]] belonging to the given resource and assigns it to it.
   * each [[StillImageRepresentation]] represents an image including regions.
   *
   * @param resource The resource to get the images for.
   * @returns A collection of images for the given resource.
   */
  private _collectRepresentationsAndAnnotations(resource: DspResource): FileRepresentation[] {
    if (!resource) {
      return;
    }

    // general object for all kind of representations
    const representations: FileRepresentation[] = [];

    // --> TODO: use proper classes and a factory
    if (resource.res.properties[Constants.HasStillImageFileValue]) {
      // --> TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)
      // resource has StillImageFileValues that are directly attached to it (properties)

      const fileValues: ReadStillImageFileValue[] = resource.res.properties[
        Constants.HasStillImageFileValue
      ] as ReadStillImageFileValue[];
      for (const img of fileValues) {
        const regions: Region[] = [];

        const annotations: DspResource[] = [];

        for (const incomingRegion of resource.incomingAnnotations) {
          const region = new Region(incomingRegion);
          regions.push(region);

          const annotation = new DspResource(incomingRegion);

          // gather region property information
          annotation.resProps = Common.initProps(incomingRegion).filter(v => v.values.length > 0);

          // gather system property information
          annotation.systemProps = incomingRegion.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

          this._actions$
            .pipe(ofActionSuccessful(GetAttachedUserAction))
            .pipe(take(1))
            .subscribe(() => {
              annotations.push(annotation);
              this._cdr.markForCheck();
            });
          this._store.dispatch(new GetAttachedUserAction(annotation.res.id, annotation.res.attachedToUser));
        }

        const stillImage = new FileRepresentation(img, regions);

        representations.push(stillImage);

        this.annotationResources = annotations;
      }
    } else if (resource.res.properties[Constants.HasDocumentFileValue]) {
      const fileValues: ReadDocumentFileValue[] = resource.res.properties[
        Constants.HasDocumentFileValue
      ] as ReadDocumentFileValue[];
      for (const doc of fileValues) {
        const document = new FileRepresentation(doc);
        representations.push(document);
      }
    } else if (resource.res.properties[Constants.HasAudioFileValue]) {
      const fileValue: ReadAudioFileValue = resource.res.properties[
        Constants.HasAudioFileValue
      ][0] as ReadAudioFileValue;
      const audio = new FileRepresentation(fileValue);
      representations.push(audio);
    } else if (resource.res.properties[Constants.HasMovingImageFileValue]) {
      const fileValue: ReadMovingImageFileValue = resource.res.properties[
        Constants.HasMovingImageFileValue
      ][0] as ReadMovingImageFileValue;
      const video = new FileRepresentation(fileValue);
      representations.push(video);
    } else if (resource.res.properties[Constants.HasArchiveFileValue]) {
      const fileValue: ReadArchiveFileValue = resource.res.properties[
        Constants.HasArchiveFileValue
      ][0] as ReadArchiveFileValue;
      const archive = new FileRepresentation(fileValue);
      representations.push(archive);
    } else if (resource.res.properties[Constants.HasTextFileValue]) {
      const fileValue: ReadTextFileValue = resource.res.properties[Constants.HasTextFileValue][0] as ReadTextFileValue;
      const text = new FileRepresentation(fileValue);
      representations.push(text);
    }
    return representations;
  }

  /**
   * get StillImageRepresentations pointing to [[this.resource]].
   * This method may have to called several times with an increasing offsetChange in order to get all available StillImageRepresentations.
   *
   * @param offset the offset to be used (needed for paging). First request uses an offset of 0.
   * It takes the number of images returned as an argument.
   */
  private _getIncomingStillImageRepresentations(offset: number): void {
    if (offset < 0 || offset > this.compoundPosition.maxOffsets) {
      this._notification.openSnackBar(`Offset of ${offset} is invalid`);
      return;
    }

    this._incomingService
      .getStillImageRepresentationsForCompoundResource(this.resource.res.id, offset)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((incomingImageRepresentations: ReadResourceSequence) => {
        if (incomingImageRepresentations.resources.length > 0) {
          // set the incoming representations for the current offset only
          this.resource.incomingRepresentations = incomingImageRepresentations.resources;
          this._getIncomingResource(this.resource.incomingRepresentations[this.compoundPosition.position].id);
        } else {
          this.loading = false;
          this.representationsToDisplay = [];
        }
        this._cdr.markForCheck();
      });
  }

  /**
   * requests incoming resources for [[this.resource]].
   * Incoming resources are: regions, representations, and incoming links.
   */
  private _requestIncomingResources(resource: DspResource): void {
    // request incoming regions --> TODO: add case to get incoming sequences in case of video and audio
    if (resource.res.properties[Constants.HasStillImageFileValue]) {
      // --> TODO: check if resources is a StillImageRepresentation using the ontology responder (support for subclass relations required)
      // the resource is a StillImageRepresentation, check if there are regions pointing to it

      this.getIncomingRegions(resource, 0);
    } else if (this.compoundPosition) {
      // this resource is not a StillImageRepresentation
      // check if there are StillImageRepresentations pointing to this resource

      // this gets the first page of incoming StillImageRepresentations
      // more pages may be requested by [[this.viewer]].
      this._getIncomingStillImageRepresentations(this.compoundPosition.offset);
    }

    // check for incoming links for the current resource
    this._getIncomingLinks(0);
  }

  getIncomingRegions(resource: DspResource, offset: number): void {
    this._incomingService
      .getIncomingRegions(resource.res.id, offset)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((regions: ReadResourceSequence) => {
        Array.prototype.push.apply(resource.incomingAnnotations, regions.resources);
        this.representationsToDisplay = this._collectRepresentationsAndAnnotations(resource);
        this._cdr.detectChanges();
      });
  }

  private _renderAsMainResource(resource: DspResource) {
    this.representationsToDisplay = this._collectRepresentationsAndAnnotations(resource);
    if (!this.representationsToDisplay.length && !this.compoundPosition) {
      this._incomingService
        .getStillImageRepresentationsForCompoundResource(resource.res.id, 0, true)
        .pipe(
          takeUntil(this.ngUnsubscribe),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe((countQuery: CountQueryResponse) => {
          if (countQuery.numberOfResults > 0) {
            this.compoundPosition = new DspCompoundPosition(countQuery.numberOfResults);
            this.compoundNavigation(1);
          }
        });
    } else {
      this._requestIncomingResources(resource);
    }
  }

  private _renderAsRegion(region: DspResource) {
    this.selectedTabLabel = 'annotations';
    this.openRegion(region.res.id);
    this.selectedRegion = region.res.id;
  }

  private _getIncomingResource(iri: string) {
    this._dspApiConnection.v2.res
      .getResource(iri)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((response: ReadResource) => {
        this.incomingResource = new DspResource(response);
        this.incomingResource.resProps = Common.initProps(response)
          .filter(v => v.values.length > 0)
          .filter(v => v.propDef.id !== 'http://api.knora.org/ontology/knora-api/v2#hasStillImageFileValue');
        this.incomingResource.systemProps =
          this.incomingResource.res.entityInfo.getPropertyDefinitionsByType(SystemPropertyDefinition);

        this.representationsToDisplay = this._collectRepresentationsAndAnnotations(this.incomingResource);
        if (
          this.representationsToDisplay.length &&
          this.representationsToDisplay[0].fileValue &&
          this.compoundPosition
        ) {
          this.getIncomingRegions(this.incomingResource, 0);
        }

        this._cdr.markForCheck();
      });
  }
}
