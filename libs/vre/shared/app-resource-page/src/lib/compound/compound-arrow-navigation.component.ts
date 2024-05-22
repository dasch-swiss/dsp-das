import { Component, Input } from '@angular/core';
import { CompoundService } from './compound.service';

@Component({
  selector: 'app-compound-arrow-navigation',
  template: ` <div
    style="height: 100%; display:flex; align-items: center; cursor: pointer"
    (click)="openPage(compoundNavigation.page + (forwardNavigation ? 1 : -1))">
    <button
      mat-button
      [disabled]="
        forwardNavigation ? compoundNavigation.page >= compoundNavigation.totalPages : compoundNavigation.page <= 1
      "
      class="full-size">
      <mat-icon>keyboard_arrow_{{ forwardNavigation ? 'right' : 'left' }}</mat-icon>
    </button>
  </div>`,
})
export class CompoundArrowNavigationComponent {
  @Input() forwardNavigation!: boolean;

  get compoundNavigation() {
    return this.compoundService.compoundPosition;
  }

  openPage(page: number) {
    this.compoundService.openPage(page);
  }

  constructor(public compoundService: CompoundService) {}
}
