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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Operator } from '../../operators.config';
import { FilterChipData, PropertyType } from '../models';

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
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="editor-panel">
      <div class="editor-content">
        <mat-form-field appearance="outline" class="property-select">
          <mat-label>Property</mat-label>
          <mat-select [(ngModel)]="selectedPropertyIri" (selectionChange)="onPropertyChange()">
            @for (prop of availableProperties; track prop.iri) {
              <mat-option [value]="prop.iri">{{ prop.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="operator-select">
          <mat-label>Operator</mat-label>
          <mat-select [(ngModel)]="selectedOperator" [disabled]="!selectedPropertyIri">
            @for (op of availableOperators; track op.value) {
              <mat-option [value]="op.value">{{ op.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (showValueInput) {
          <mat-form-field appearance="outline" class="value-input">
            <mat-label>Value</mat-label>
            <input matInput [(ngModel)]="inputValue" [placeholder]="valuePlaceholder" />
          </mat-form-field>
        }
      </div>

      <div class="editor-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" [disabled]="!isValid" (click)="onApply()">
          {{ isEditMode ? 'Update' : 'Add' }} Filter
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .editor-panel {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        background: var(--mat-app-surface, #fff);
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 8px;
        margin-top: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .editor-content {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: flex-start;
      }

      .property-select {
        min-width: 200px;
        flex: 1;
      }

      .operator-select {
        min-width: 150px;
      }

      .value-input {
        min-width: 200px;
        flex: 1;
      }

      .editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
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

  onPropertyChange(): void {
    this.selectedOperator = Operator.Equals;
    this.inputValue = '';
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
