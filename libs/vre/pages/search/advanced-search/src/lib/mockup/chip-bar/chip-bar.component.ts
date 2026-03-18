import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FilterChipData } from '../models';
import { AddFilterButtonComponent } from './add-filter-button.component';
import { FilterChipComponent } from './filter-chip/filter-chip.component';

@Component({
  selector: 'app-chip-bar',
  standalone: true,
  imports: [CommonModule, FilterChipComponent, AddFilterButtonComponent],
  template: `
    <div class="chip-bar">
      @if (organizedFilters.length === 0 && !isAddingFilter) {
        <div class="empty-state">
          <span class="empty-message">Add your first filter</span>
        </div>
      }

      @for (filter of organizedFilters; track filter.id) {
        <div class="chip-wrapper" [class.nested]="filter.parentId">
          <app-filter-chip
            [filter]="filter"
            [isEditing]="editingFilterId === filter.id"
            (edit)="onEditFilter(filter)"
            (remove)="onRemoveFilter(filter)" />
        </div>
      }

      <app-add-filter-button [isExpanded]="isAddingFilter" (toggle)="onToggleAdd()" />
    </div>
  `,
  styles: [
    `
      .chip-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        padding: 12px;
        max-width: 80vw;
        background: var(--mat-app-surface, #fff);
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        min-height: 56px;
      }

      .empty-state {
        display: flex;
        align-items: center;
        flex: 1;
      }

      .empty-message {
        color: rgba(0, 0, 0, 0.54);
        font-size: 14px;
        font-style: italic;
      }

      .chip-wrapper {
        display: contents;
      }

      .chip-wrapper.nested {
        display: flex;
        width: 100%;
        margin-left: 24px;
        padding-left: 8px;
        border-left: 2px solid var(--mat-divider-color, rgba(0, 0, 0, 0.12));
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipBarComponent {
  @Input({ required: true }) filters: FilterChipData[] = [];
  @Input() editingFilterId: string | null = null;
  @Input() isAddingFilter = false;

  @Output() editFilter = new EventEmitter<FilterChipData>();
  @Output() removeFilter = new EventEmitter<FilterChipData>();
  @Output() toggleAdd = new EventEmitter<void>();

  get organizedFilters(): FilterChipData[] {
    const parentFilters = this.filters.filter(f => !f.parentId);
    const result: FilterChipData[] = [];

    for (const parent of parentFilters) {
      result.push(parent);
      const children = this.filters.filter(f => f.parentId === parent.id);
      result.push(...children);
    }

    return result;
  }

  onEditFilter(filter: FilterChipData): void {
    this.editFilter.emit(filter);
  }

  onRemoveFilter(filter: FilterChipData): void {
    this.removeFilter.emit(filter);
  }

  onToggleAdd(): void {
    this.toggleAdd.emit();
  }
}
