import { Component } from '@angular/core';
import { FileRepresentation } from '@dasch-swiss/vre/shared/app-representations';
import { getFileValue } from '../get-file-value';
import { ResourcePageService } from '../resource-page.service';
import { CompoundService } from './compound.service';

@Component({
  selector: 'app-compound-viewer',
  template: `
    <ng-container *ngIf="compoundService.compoundPosition">
      <app-still-image
        *ngIf="compoundService.incomingResource as incomingResource"
        class="dsp-representation stillimage"
        [parentResource]="resourcePageService.resource.res"
        [image]="fileRepresentation">
        <div navigationArrows class="navigation-arrows">
          <app-compound-arrow-navigation [forwardNavigation]="false" />
          <app-compound-arrow-navigation [forwardNavigation]="true" />
        </div>
        <app-compound-navigation navigation />
        <app-compound-slider slider />
      </app-still-image>
    </ng-container>
  `,
  styles: [
    `
      .navigation-arrows {
        position: absolute;
        width: 100%;
        display: flex;
        justify-content: space-between;
        z-index: 100;
        height: 100%;
      }
    `,
  ],
})
export class CompoundViewerComponent {
  get fileRepresentation() {
    return new FileRepresentation(getFileValue(this.compoundService.incomingResource!));
  }

  constructor(
    public resourcePageService: ResourcePageService,
    public compoundService: CompoundService
  ) {}
}
