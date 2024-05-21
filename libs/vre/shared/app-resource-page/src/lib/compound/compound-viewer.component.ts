import { Component } from '@angular/core';
import { FileRepresentation } from '../file-representation';
import { IncomingRepresentationsService } from '../incoming-representations.service';

@Component({
  selector: 'app-compound-viewer',
  template: ` <app-still-image
    class="dsp-representation stillimage"
    *ngIf="incomingRepresentationsService.representationsToDisplay.length > 0"
    [image]="incomingRepresentationsService.representationsToDisplay[0]"></app-still-image>`,
})
export class CompoundViewerComponent {
  images: FileRepresentation[];

  constructor(public incomingRepresentationsService: IncomingRepresentationsService) {}
}
