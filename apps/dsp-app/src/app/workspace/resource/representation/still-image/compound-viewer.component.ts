import { Component } from '@angular/core';
import { IncomingRepresentationsService } from '@dsp-app/src/app/workspace/resource/incoming-representations.service';
import { FileRepresentation } from '@dsp-app/src/app/workspace/resource/representation/file-representation';

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

  ngOnInit() {}
}
