import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Operator } from '../../operators.config';
import { ChipSelectorComponent, ChipSelectorOption } from '../chip-selector/chip-selector.component';
import { FilterChipData, PropertyType, PROPERTY_TYPE_ICONS } from '../models';

export interface PropertyOption {
  iri: string;
  label: string;
  objectType: PropertyType;
}

export interface OperatorOption {
  value: Operator;
  label: string;
}

@Component({
  selector: 'app-editor-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ChipSelectorComponent,
  ],
  template: `
    <div class="editor-panel">
      <div class="editor-chips">
        <app-chip-selector
          [value]="selectedPropertyIri"
          [options]="propertyChipOptions"
          placeholder="Property"
          (selectionChange)="onPropertyChipChange($event)" />

        <app-chip-selector
          [value]="selectedOperator"
          [options]="operatorChipOptions"
          placeholder="Operator"
          [disabled]="!selectedPropertyIri"
          (selectionChange)="onOperatorChipChange($event)" />

        @if (showValueInput) {
          <input
            class="chip-input"
            [(ngModel)]="inputValue"
            [placeholder]="valuePlaceholder"
            (keydown.enter)="onApply()" />
        }

        <div class="editor-actions">
          <button mat-icon-button color="primary" [disabled]="!isValid" (click)="onApply()" title="Apply filter">
            <mat-icon>check</mat-icon>
          </button>
          <button mat-icon-button (click)="onCancel()" title="Cancel">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .editor-panel {
        display: flex;
        flex-direction: column;
        padding: 12px 16px;
        background: var(--mat-app-surface, #fff);
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        margin-top: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .editor-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .chip-input {
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.4;
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.12);
        outline: none;
        min-width: 120px;
        max-width: 200px;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .chip-input:focus {
        border-color: rgba(63, 81, 181, 0.5);
        box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
      }

      .chip-input::placeholder {
        color: rgba(0, 0, 0, 0.4);
      }

      .editor-actions {
        display: flex;
        gap: 4px;
        margin-left: auto;
      }

      .editor-actions button {
        width: 32px;
        height: 32px;
      }

      .editor-actions button mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPanelComponent implements OnChanges {
  @Input() editingFilter?: FilterChipData;
  @Input() availableProperties: PropertyOption[] = [];

  @Output() apply = new EventEmitter<Partial<FilterChipData>>();
  @Output() cancelEdit = new EventEmitter<void>();

  selectedPropertyIri: string | null = null;
  selectedOperator: Operator | null = null;
  inputValue = '';

  readonly availableOperators: OperatorOption[] = [
    { value: Operator.Equals, label: 'equals' },
    { value: Operator.NotEquals, label: 'does not equal' },
    { value: Operator.Exists, label: 'exists' },
    { value: Operator.NotExists, label: 'does not exist' },
    { value: Operator.IsLike, label: 'is like' },
    { value: Operator.Matches, label: 'matches' },
  ];

  get isEditMode(): boolean {
    return !!this.editingFilter;
  }

  get selectedProperty(): PropertyOption | undefined {
    return this.availableProperties.find(p => p.iri === this.selectedPropertyIri);
  }

  get propertyChipOptions(): ChipSelectorOption[] {
    return this.availableProperties.map(p => ({
      value: p.iri,
      label: p.label,
      icon: PROPERTY_TYPE_ICONS[p.objectType] ?? 'help_outline',
    }));
  }

  get operatorChipOptions(): ChipSelectorOption[] {
    return this.availableOperators.map(op => ({
      value: op.value,
      label: op.label,
    }));
  }

  get showValueInput(): boolean {
    return (
      !!this.selectedOperator &&
      this.selectedOperator !== Operator.Exists &&
      this.selectedOperator !== Operator.NotExists
    );
  }

  get valuePlaceholder(): string {
    const type = this.selectedProperty?.objectType;
    switch (type) {
      case 'date':
        return 'YYYY-MM-DD';
      case 'integer':
      case 'decimal':
        return 'Enter number';
      case 'uri':
        return 'https://...';
      default:
        return 'Enter value';
    }
  }

  get isValid(): boolean {
    if (!this.selectedPropertyIri || !this.selectedOperator) {
      return false;
    }
    if (this.selectedOperator === Operator.Exists || this.selectedOperator === Operator.NotExists) {
      return true;
    }
    return !!this.inputValue.trim();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingFilter'] && this.editingFilter) {
      this.selectedPropertyIri = this.editingFilter.propertyIri;
      this.selectedOperator = this.editingFilter.operatorIri as Operator;
      this.inputValue = this.editingFilter.valueLabel || '';
    } else if (changes['editingFilter'] && !this.editingFilter) {
      this.resetForm();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onCancel();
  }

  onPropertyChipChange(propertyIri: string): void {
    this.selectedPropertyIri = propertyIri;
    this.selectedOperator = Operator.Equals;
    this.inputValue = '';
  }

  onOperatorChipChange(operator: string): void {
    this.selectedOperator = operator as Operator;
  }

  onCancel(): void {
    this.resetForm();
    this.cancelEdit.emit();
  }

  onApply(): void {
    if (!this.isValid || !this.selectedProperty) {
      return;
    }

    const filterData: Partial<FilterChipData> = {
      id: this.editingFilter?.id,
      propertyIri: this.selectedPropertyIri!,
      propertyLabel: this.selectedProperty.label,
      propertyType: this.selectedProperty.objectType,
      operatorIri: this.selectedOperator!,
      operatorLabel: this.getOperatorLabel(this.selectedOperator!),
      value: this.inputValue || null,
      valueLabel: this.inputValue,
    };

    this.apply.emit(filterData);
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedPropertyIri = null;
    this.selectedOperator = null;
    this.inputValue = '';
  }

  private getOperatorLabel(operator: Operator): string {
    return this.availableOperators.find(o => o.value === operator)?.label ?? operator;
  }
}
