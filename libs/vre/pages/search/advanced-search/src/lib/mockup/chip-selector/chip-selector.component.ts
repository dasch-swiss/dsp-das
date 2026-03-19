import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export interface ChipSelectorOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-chip-selector',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule],
  template: `
    <div
      class="chip-selector"
      [class.has-value]="!!value"
      [class.disabled]="disabled"
      [matMenuTriggerFor]="disabled ? null : optionsMenu">
      @if (selectedOption?.icon) {
        <mat-icon class="chip-icon">{{ selectedOption.icon }}</mat-icon>
      }
      <span class="chip-label">{{ selectedOption?.label || placeholder }}</span>
      <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
    </div>
    <mat-menu #optionsMenu="matMenu" class="chip-selector-menu">
      @for (option of options; track option.value) {
        <button mat-menu-item (click)="onSelect(option)" [class.selected]="option.value === value">
          @if (option.icon) {
            <mat-icon>{{ option.icon }}</mat-icon>
          }
          <span>{{ option.label }}</span>
        </button>
      }
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }

      .chip-selector {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 8px 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.4;
        background: rgba(0, 0, 0, 0.06);
        border: 1px solid rgba(0, 0, 0, 0.12);
        cursor: pointer;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease;
        min-width: 80px;
        max-width: 200px;
      }

      .chip-selector:hover:not(.disabled) {
        background: rgba(0, 0, 0, 0.1);
        border-color: rgba(0, 0, 0, 0.2);
      }

      .chip-selector.has-value {
        background: rgba(63, 81, 181, 0.1);
        border-color: rgba(63, 81, 181, 0.3);
      }

      .chip-selector.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .chip-icon {
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

      .dropdown-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.6;
        margin-right: -4px;
      }

      ::ng-deep .chip-selector-menu .selected {
        background-color: rgba(63, 81, 181, 0.08);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipSelectorComponent {
  @Input() value: string | null = null;
  @Input() options: ChipSelectorOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() disabled = false;

  @Output() selectionChange = new EventEmitter<string>();

  get selectedOption(): ChipSelectorOption | undefined {
    return this.options.find(o => o.value === this.value);
  }

  onSelect(option: ChipSelectorOption): void {
    this.selectionChange.emit(option.value);
  }
}
