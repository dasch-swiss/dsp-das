import { Component, OnInit } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { CompoundService } from './compound.service';

@Component({
  selector: 'app-compound-viewer',
  template: `
    <ng-container *ngIf="compoundService.compoundPosition">
      <ng-container *ngIf="incomingResource">
        <app-still-image class="dsp-representation" [resource]="incomingResource.res" [compoundMode]="true" />
      </ng-container>
    </ng-container>
  `,
})
export class CompoundViewerComponent implements OnInit {
  incomingResource: DspResource | undefined;
  constructor(public compoundService: CompoundService) {}

  ngOnInit() {
    this.compoundService.incomingResource$.subscribe(resource => {
      this.incomingResource = resource;
    });
  }
}
