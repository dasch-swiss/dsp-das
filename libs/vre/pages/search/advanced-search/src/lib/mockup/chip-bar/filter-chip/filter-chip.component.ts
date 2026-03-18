import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterChipData, PROPERTY_TYPE_COLORS, PROPERTY_TYPE_ICONS } from '../../models';

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, MatTooltipModule],
  template: `
    <div
      class="filter-chip"
      [class.expanded]="isHovered"
      [class.editing]="isEditing"
      [style.background-color]="chipColor"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()">
      <mat-icon class="type-icon">{{ typeIcon }}</mat-icon>
      <span class="chip-label">{{ displayLabel }}</span>
      <button class="chip-action" (click)="onEdit($event)" [matTooltip]="'Edit filter'">
        <mat-icon>edit</mat-icon>
      </button>
      <button class="chip-action remove" (click)="onRemove($event)" [matTooltip]="'Remove filter'">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 6px 10px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.4;
        max-width: 200px;
        transition:
          max-width 0.2s ease-out,
          box-shadow 0.2s ease-out;
        cursor: default;
        border: 1px solid rgba(0, 0, 0, 0.12);
      }

      .filter-chip.expanded {
        max-width: 400px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .filter-chip.editing {
        border-color: var(--mat-primary, #3f51b5);
        box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
      }

      .type-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        opacity: 0.7;
      }

      .chip-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .filter-chip.expanded .chip-label {
        white-space: normal;
        overflow: visible;
      }

      .chip-action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: none;
        background: transparent;
        cursor: pointer;
        border-radius: 50%;
        padding: 0;
        opacity: 0.6;
        transition:
          opacity 0.15s,
          background-color 0.15s;
      }

      .chip-action:hover {
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.08);
      }

      .chip-action.remove:hover {
        background-color: rgba(244, 67, 54, 0.15);
      }

      .chip-action mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipComponent {
  @Input({ required: true }) filter!: FilterChipData;
  @Input() isEditing = false;
  @Output() edit = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  isHovered = false;
  private hoverTimeout?: ReturnType<typeof setTimeout>;

  get typeIcon(): string {
    return PROPERTY_TYPE_ICONS[this.filter.propertyType] ?? 'help_outline';
  }

  get chipColor(): string {
    return PROPERTY_TYPE_COLORS[this.filter.propertyType] ?? 'rgba(0, 0, 0, 0.08)';
  }

  get displayLabel(): string {
    const { propertyLabel, operatorLabel, valueLabel } = this.filter;
    if (!valueLabel) {
      return `${propertyLabel} ${operatorLabel}`;
    }
    return `${propertyLabel} ${operatorLabel} "${valueLabel}"`;
  }

  onMouseEnter(): void {
    this.hoverTimeout = setTimeout(() => {
      this.isHovered = true;
    }, 300);
  }

  onMouseLeave(): void {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.isHovered = false;
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit();
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit();
  }
}
