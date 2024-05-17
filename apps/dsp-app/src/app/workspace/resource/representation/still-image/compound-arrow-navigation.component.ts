import { Component, Input } from '@angular/core';
import { IncomingRepresentationsService } from '@dsp-app/src/app/workspace/resource/incoming-representations.service';

@Component({
  selector: 'app-compound-arrow-navigation',
  template: ` <div class="navigation vertical previous">
    <button
      mat-button
      [disabled]="compoundNavigation.page * (forwardNavigation ? 1 : -1) <= 1"
      (click)="openPage(compoundNavigation.page + (forwardNavigation ? 1 : -1))"
      class="full-size">
      <mat-icon>keyboard_arrow_{{ forwardNavigation ? 'right' : 'left' }}</mat-icon>
    </button>
  </div>`,
})
export class CompoundArrowNavigationComponent {
  @Input() forwardNavigation!: boolean;

  get compoundNavigation() {
    return this.incomingService.compoundPosition;
  }

  openPage(page: number) {
    this.incomingService.compoundNavigation(page);
  }

  constructor(public incomingService: IncomingRepresentationsService) {}
}
