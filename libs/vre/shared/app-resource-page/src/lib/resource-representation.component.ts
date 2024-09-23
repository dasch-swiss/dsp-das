import { Component, Input, OnChanges } from '@angular/core';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { FileRepresentation, RepresentationConstants, getFileValue } from '@dasch-swiss/vre/shared/app-representations';
import { ResourceSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-resource-representation',
  template: ` <div class="representation-container center" [ngSwitch]="representationToDisplay.fileValue.type">
    <app-still-image
      #stillImage
      class="dsp-representation stillimage"
      [attachedProject]="attachedProject$ | async"
      *ngSwitchCase="representationConstants.stillImage"
      [resource]="resource.res" />
    <app-still-image
      #stillImage
      class="dsp-representation stillimage"
      *ngSwitchCase="representationConstants.externalStillImage"
      [attachedProject]="attachedProject$ | async"
      [resource]="resource.res" />

    <app-document
      #document
      class="dsp-representation document"
      [class.pdf]="representationToDisplay.fileValue.filename.split('.').pop() === 'pdf'"
      *ngSwitchCase="representationConstants.document"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      [attachedProject]="attachedProject$ | async"
      (loaded)="representationLoaded($event)">
    </app-document>

    <app-audio
      #audio
      class="dsp-representation audio"
      *ngSwitchCase="representationConstants.audio"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      [isAdmin]="isAdmin$ | async"
      (loaded)="representationLoaded($event)">
    </app-audio>

    <app-video
      #video
      class="dsp-representation video"
      *ngSwitchCase="representationConstants.movingImage"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      [isAdmin]="isAdmin$ | async"
      (loaded)="representationLoaded($event)">
    </app-video>

    <app-archive
      #archive
      class="dsp-representation archive"
      *ngSwitchCase="representationConstants.archive"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      [attachedProject]="attachedProject$ | async"
      (loaded)="representationLoaded($event)">
    </app-archive>

    <app-text
      #text
      class="dsp-representation text"
      *ngSwitchCase="representationConstants.text"
      [src]="representationToDisplay"
      [parentResource]="resource.res"
      [attachedProject]="attachedProject$ | async"
      (loaded)="representationLoaded($event)">
    </app-text>
  </div>`,
})
export class ResourceRepresentationComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;
  representationToDisplay!: FileRepresentation;

  loading = false;
  protected readonly representationConstants = RepresentationConstants;

  get attachedToProjectResource(): string {
    return this.resource.res.attachedToProject;
  }

  attachedProject$: Observable<ReadProject | undefined> = this._store.select(ResourceSelectors.attachedProjects).pipe(
    filter(attachedProjects => !!attachedProjects && Object.values(attachedProjects).length > 0),
    map(attachedProjects => {
      const parentResource = this.resource.res;
      const attachedProject =
        attachedProjects[parentResource.id] && attachedProjects[parentResource.id].value.length > 0
          ? attachedProjects[parentResource.id].value.find(u => u.id === parentResource.attachedToProject)
          : undefined;
      return attachedProject;
    })
  );

  isAdmin$: Observable<boolean> = combineLatest([
    this._store.select(UserSelectors.user),
    this._store.select(UserSelectors.userProjectAdminGroups),
  ]).pipe(
    map(([user, userProjectGroups]) => {
      return this.attachedToProjectResource
        ? ProjectService.IsProjectAdminOrSysAdmin(user!, userProjectGroups, this.attachedToProjectResource)
        : false;
    })
  );

  constructor(private _store: Store) {}

  ngOnChanges() {
    this.representationToDisplay = new FileRepresentation(getFileValue(this.resource)!);
  }

  representationLoaded(e: boolean) {
    this.loading = !e;
  }
}
