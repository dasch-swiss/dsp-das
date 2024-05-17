import { Component } from '@angular/core';
import { IncomingRepresentationsService } from '@dsp-app/src/app/workspace/resource/incoming-representations.service';

@Component({
  selector: 'app-compound-navigation',
  template: ` <span class="compound-nav">
    <button mat-icon-button [disabled]="compoundNavigation.page <= 1" matTooltip="First page" (click)="openPage(1)">
      <mat-icon>first_page</mat-icon>
    </button>
    <button
      mat-icon-button
      [disabled]="compoundNavigation.page <= 1"
      matTooltip="Previous page"
      (click)="openPage(compoundNavigation.page - 1)">
      <mat-icon>navigate_before</mat-icon>
    </button>
    <span class="range">{{ compoundNavigation.page }} of {{ compoundNavigation.totalPages }}</span>
    <button
      mat-icon-button
      [disabled]="compoundNavigation.page >= compoundNavigation.totalPages"
      matTooltip="Next page"
      (click)="openPage(compoundNavigation.page + 1)">
      <mat-icon>navigate_next</mat-icon>
    </button>
    <button
      mat-icon-button
      [disabled]="compoundNavigation.page === compoundNavigation.totalPages"
      matTooltip="Last page"
      (click)="openPage(compoundNavigation.totalPages)">
      <mat-icon>last_page</mat-icon>
    </button>
  </span>`,
})
export class CompoundNavigationComponent {
  get compoundNavigation() {
    return this.incomingService.compoundPosition;
  }

  openPage(page: number) {
    this.incomingService.compoundNavigation(page);
  }

  constructor(public incomingService: IncomingRepresentationsService) {}
}
