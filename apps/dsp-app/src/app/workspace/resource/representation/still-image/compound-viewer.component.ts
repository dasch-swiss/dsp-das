import { Component } from '@angular/core';
import { IncomingRepresentationsService } from '@dsp-app/src/app/workspace/resource/incoming-representations.service';
import { FileRepresentation } from '@dsp-app/src/app/workspace/resource/representation/file-representation';

@Component({
  selector: 'app-compound-viewer',
  template:
    'AAAAA<app-still-image *ngIf="incomingRepresentationsService.representationsToDisplay.length > 0" [image]="incomingRepresentationsService.representationsToDisplay[0]"></app-still-image>B',
})
export class CompoundViewerComponent {
  images: FileRepresentation[];

  constructor(public incomingRepresentationsService: IncomingRepresentationsService) {}

  ngOnInit() {}
}
