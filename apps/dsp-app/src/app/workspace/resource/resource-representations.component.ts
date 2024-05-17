import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DspCompoundPosition, DspResource } from '@dasch-swiss/vre/shared/app-common';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import {
  FileRepresentation,
  RepresentationConstants,
} from '@dsp-app/src/app/workspace/resource/representation/file-representation';
import { Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resource-representations',
  template: ` <div
    class="representation-container center"
    *ngIf="representationsToDisplay?.length && representationsToDisplay[0].fileValue"
    [ngSwitch]="representationsToDisplay[0].fileValue?.type">
    <!-- still image view -->
    <app-still-image
      #stillImage
      class="dsp-representation stillimage"
      *ngSwitchCase="representationConstants.stillImage"
      [image]="representationsToDisplay[0]"
      [imageCaption]="resourceLabel(incomingResource, resource)"
      [resourceIri]="incomingResource ? incomingResource.res.id : resource.res.id"
      [project]="resource.res.attachedToProject"
      [currentTab]="selectedTabLabel"
      [parentResource]="incomingResource ? incomingResource.res : resource.res"
      [activateRegion]="selectedRegion"
      [editorPermissions]="isEditor$ | async"
      (loaded)="representationLoaded($event)"
      (regionClicked)="openRegion.emit($event)"
      (regionAdded)="updateRegions($event)">
    </app-still-image>

    <app-document
      #document
      class="dsp-representation document"
      [class.pdf]="representationsToDisplay[0].fileValue.filename.split('.').pop() === 'pdf'"
      *ngSwitchCase="representationConstants.document"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-document>

    <app-audio
      #audio
      class="dsp-representation audio"
      *ngSwitchCase="representationConstants.audio"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-audio>

    <app-video
      #video
      class="dsp-representation video"
      *ngSwitchCase="representationConstants.movingImage"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-video>

    <app-archive
      #archive
      class="dsp-representation archive"
      *ngSwitchCase="representationConstants.archive"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-archive>

    <app-text
      #text
      class="dsp-representation text"
      *ngSwitchCase="representationConstants.text"
      [src]="representationsToDisplay[0]"
      [parentResource]="resource.res"
      (loaded)="representationLoaded($event)">
    </app-text>

    <span *ngSwitchDefault>
      The file representation type "{{ representationsToDisplay[0].fileValue.type }}" is not yet implemented
    </span>
  </div>`,
})
export class ResourceRepresentationsComponent {
  @Input({ required: true }) resource!: DspResource;
  @Input({ required: true }) incomingResource!: DspResource;
  @Input({ required: true }) representationsToDisplay: FileRepresentation[];
  @Input({ required: true }) compoundPosition!: DspCompoundPosition;
  @Input({ required: true }) selectedTabLabel!: string;
  @Input({ required: true }) selectedRegion!: string;

  @Output() openRegion = new EventEmitter<string>();
  @Output() getIncomingRegions = new EventEmitter<{ resource: DspResource; offset: number }>();

  loading = false;
  protected readonly representationConstants = RepresentationConstants;

  isEditor$: Observable<boolean> = combineLatest([
    this._store.select(UserSelectors.user),
    this._store.select(UserSelectors.userProjectAdminGroups),
  ]).pipe(
    map(([user, userProjectGroups]) => {
      return this.attachedToProjectResource
        ? ProjectService.IsProjectMemberOrAdminOrSysAdmin(user, userProjectGroups, this.attachedToProjectResource)
        : false;
    })
  );

  get attachedToProjectResource(): string {
    return this.resource.res.attachedToProject;
  }

  constructor(private _store: Store) {}

  representationLoaded(e: boolean) {
    this.loading = !e;
  }

  resourceLabel = (incomingResource: DspResource, resource: DspResource) => {
    return incomingResource ? `${resource.res.label}: ${incomingResource.res.label}` : resource.res.label;
  };

  updateRegions(iri: string) {
    if (this.incomingResource) {
      this.incomingResource.incomingAnnotations = [];
    } else {
      this.resource.incomingAnnotations = [];
    }
    this.getIncomingRegions.emit({
      resource: this.incomingResource ? this.incomingResource : this.resource,
      offset: 0,
    });
    this.openRegion.emit(iri);
  }
}
