import { Component, Input } from '@angular/core';
import { PropertiesDisplayService } from './properties-display.service';

@Component({
  selector: 'app-properties-toolbar',
  template: `
    <button
      mat-button
      color="primary"
      class="toggle-props"
      [matTooltip]="((showAllComments$ | async) ? 'Hide' : 'Show all') + ' comments'"
      matTooltipPosition="above"
      (click)="toggleShowAllComments()">
      <mat-icon>{{ (showAllComments$ | async) ? 'comments_disabled' : 'comment' }}</mat-icon>
      <span *ngIf="!showOnlyIcons">{{ (showAllComments$ | async) ? 'Hide' : 'Show all' }} comments</span>
    </button>

    <button
      mat-button
      color="primary"
      class="toggle-props"
      *ngIf="showToggleProperties"
      [matTooltip]="((propertiesDisplayService.showAllProperties$ | async) ? 'Hide empty' : 'Show all') + ' properties'"
      matTooltipPosition="above"
      (click)="toggleShowAllProps()">
      <mat-icon>{{ (propertiesDisplayService.showAllProperties$ | async) ? 'unfold_less' : 'unfold_more' }}</mat-icon>
      <span *ngIf="!showOnlyIcons"
        >{{ (propertiesDisplayService.showAllProperties$ | async) ? 'Hide empty' : 'Show all' }} properties</span
      >
    </button>
  `,
  styles: ['button { padding-top: 24px; padding-bottom: 24px}'],
})
export class PropertiesToolbarComponent {
  @Input({ required: true }) showToggleProperties!: boolean;
  @Input() showOnlyIcons = false;
  showAllComments$ = this.propertiesDisplayService.showComments$;

  constructor(public propertiesDisplayService: PropertiesDisplayService) {}

  toggleShowAllProps() {
    this.propertiesDisplayService.toggleShowProperties();
  }

  toggleShowAllComments() {
    this.propertiesDisplayService.toggleShowComments();
  }
}
