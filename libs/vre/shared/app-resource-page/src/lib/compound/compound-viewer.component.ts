import { Component } from '@angular/core';
import { FileRepresentation, getFileValue } from '@dasch-swiss/vre/shared/app-representations';
import { CompoundService } from './compound.service';

@Component({
  selector: 'app-compound-viewer',
  template: `
    <ng-container *ngIf="compoundService.compoundPosition">
      <ng-container *ngIf="compoundService.incomingResource as incomingResource">
        <div *ngIf="!isNextPageAvailable" class="note warning">
          Some incoming resources may not be accessible due to the lack of permissions.
        </div>
        <app-still-image
          class="dsp-representation stillimage"
          *ngIf="imageIsAccessible"
          [resource]="incomingResource.res">
          <div navigationArrows class="arrows">
            <app-compound-arrow-navigation [forwardNavigation]="false" class="arrow" />
            <app-compound-arrow-navigation [forwardNavigation]="true" class="arrow" />
          </div>
          <app-compound-navigation navigation />
          <app-compound-slider slider />
        </app-still-image>
      </ng-container>
    </ng-container>
  `,
  styles: [
    `
      .arrow {
        position: absolute;
        z-index: 1;
        height: 100%;

        &:first-child {
          left: 0;
        }

        &:nth-child(2) {
          right: 0;
        }
      }
    `,
  ],
})
export class CompoundViewerComponent {
  get fileRepresentation() {
    return new FileRepresentation(getFileValue(this.compoundService.incomingResource!)!);
  }

  get imageIsAccessible() {
    return this.fileRepresentation.fileValue;
  }

  get isNextPageAvailable() {
    if (!this.compoundService || !this.compoundService.compoundPosition) {
      return false;
    }

    return (
      !this.compoundService.compoundPosition ||
      this.compoundService.compoundPosition.isLastPage ||
      this.compoundService.isNextPageAvailable(this.compoundService.compoundPosition.page)
    );
  }

  constructor(public compoundService: CompoundService) {}
}
