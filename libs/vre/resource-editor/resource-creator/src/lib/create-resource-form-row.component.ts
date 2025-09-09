import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-create-resource-form-row',
  template: `
    <div style="display: flex">
      <h3
        class="mat-subtitle-2 grid-h3"
        [ngClass]="{ 'with-tooltip': tooltip !== undefined }"
        [matTooltipDisabled]="tooltip === undefined"
        [matTooltip]="tooltip"
        matTooltipPosition="above">
        {{ label }}
      </h3>
      <div style="flex: 1">
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      .grid-h3 {
        width: 140px;
        text-align: end;
        padding: 16px;
        margin: 0;
        color: rgb(107, 114, 128);

        &.with-tooltip {
          cursor: help;
        }
      }
    `,
  ],
  standalone: true,
  imports: [NgClass, MatTooltip],
})
export class CreateResourceFormRowComponent {
  @Input({ required: true }) label!: string;
  @Input() tooltip?: string;
}
