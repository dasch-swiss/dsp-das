import { Component } from '@angular/core';
import { IncomingRepresentationsService } from '../incoming-representations.service';

@Component({
  selector: 'app-compound-viewer',
  template: ` <app-still-image
      class="dsp-representation stillimage"
      *ngIf="incomingRepresentationsService.representationsToDisplay.length > 0"
      [parentResource]="incomingRepresentationsService.incomingResource?.res"
      [image]="incomingRepresentationsService.representationsToDisplay[0]"></app-still-image>

    <h5>(DEV TEAM) The following elements will be integrated to the still image navigation soon</h5>
    <div style="display: flex">
      <app-compound-arrow-navigation [forwardNavigation]="false"></app-compound-arrow-navigation>
      <app-compound-arrow-navigation [forwardNavigation]="true"></app-compound-arrow-navigation>
      <app-compound-slider></app-compound-slider>
      <app-compound-navigation></app-compound-navigation>
    </div>`,
})
export class CompoundViewerComponent {
  constructor(public incomingRepresentationsService: IncomingRepresentationsService) {}
}
