import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { IriLabelPair } from '../../model';
import { Operator } from '../../operators.config';
import { ChipSelectorComponent, ChipSelectorOption } from '../chip-selector/chip-selector.component';
import { PropertyOption } from '../editor-panel/editor-panel.component';
import { FilterChipData, PROPERTY_TYPE_ICONS, PropertyType } from '../models';

export interface StatementDialogData {
  statements: FilterChipData[];
  properties: PropertyOption[];
  resourceClass: IriLabelPair;
  onStatementApply: (statement: Partial<FilterChipData>) => void;
  onStatementRemove: (statementId: string) => void;
}

@Component({
  selector: 'app-statement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    ChipSelectorComponent,
  ],
  template: `
    <div class="statement-dialog">
      <!-- Existing statements section -->
      @if (data.statements.length > 0) {
        <div class="section-header">
          <mat-icon>tune</mat-icon>
          <span>Active statements</span>
        </div>

        <div class="statements-container">
          @for (stmt of data.statements; track stmt.id) {
            <div class="statement-chip" [matMenuTriggerFor]="editMenu">
              <mat-icon class="statement-icon">{{ getPropertyIcon(stmt.propertyType) }}</mat-icon>
              <span class="statement-text">
                {{ stmt.propertyLabel }} {{ stmt.operatorLabel }}
                @if (stmt.valueLabel) {
                  "{{ stmt.valueLabel }}"
                }
              </span>
              <button class="remove-btn" (click)="onRemoveStatement(stmt.id, $event)" title="Remove statement">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Edit submenu for this statement -->
            <mat-menu #editMenu="matMenu" class="editor-submenu">
              <div class="editor-panel" (click)="$event.stopPropagation()">
                <div class="editor-header">
                  <mat-icon>{{ getPropertyIcon(stmt.propertyType) }}</mat-icon>
                  <span>{{ stmt.propertyLabel }}</span>
                </div>

                <div class="editor-fields">
                  <app-chip-selector
                    [value]="getEditOperator(stmt)"
                    [options]="getOperatorOptions(stmt.propertyType)"
                    placeholder="Operator"
                    (selectionChange)="onEditOperatorChange(stmt, $event)" />

                  @if (showValueInputForStatement(stmt)) {
                    @switch (stmt.propertyType) {
                      @case ('boolean') {
                        <app-chip-selector
                          [value]="getEditValue(stmt)"
                          [options]="booleanOptions"
                          placeholder="Value"
                          (selectionChange)="onEditValueChange(stmt, $event)" />
                      }
                      @default {
                        <input
                          class="editor-input"
                          type="text"
                          [ngModel]="getEditValue(stmt)"
                          (ngModelChange)="onEditValueChange(stmt, $event)"
                          [placeholder]="getPlaceholder(stmt.propertyType)" />
                      }
                    }
                  }
                </div>

                <div class="editor-actions">
                  <button
                    mat-icon-button
                    color="primary"
                    [disabled]="!isEditValid(stmt)"
                    (click)="onEditApply(stmt)"
                    title="Update">
                    <mat-icon>check</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="onRemoveStatement(stmt.id, $event)" title="Remove">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-menu>
          }
        </div>

        <mat-divider />
      }

      <!-- Search/filter input -->
      <div class="search-container">
        <mat-icon class="search-icon">search</mat-icon>
        <input class="search-input" type="text" [(ngModel)]="propertyFilter" placeholder="Search properties..." />
        @if (propertyFilter) {
          <button class="clear-search" (click)="propertyFilter = ''">
            <mat-icon>close</mat-icon>
          </button>
        }
      </div>

      <!-- Property list (scrollable) - use proper mat-menu-item for hover behavior -->
      <div class="property-list">
        @for (prop of filteredProperties; track prop.iri) {
          <button mat-menu-item [matMenuTriggerFor]="operatorMenu" class="property-menu-item">
            <mat-icon>{{ getPropertyIcon(prop.objectType) }}</mat-icon>
            <span>{{ prop.label }}</span>
          </button>

          <!-- Operator submenu (appears on hover) -->
          <mat-menu #operatorMenu="matMenu" class="operator-submenu">
            @for (op of getOperatorOptions(prop.objectType); track op.value) {
              @if (operatorNeedsValue(op.value)) {
                <button mat-menu-item [matMenuTriggerFor]="valueMenu" class="operator-menu-item">
                  <span>{{ op.label }}</span>
                </button>

                <!-- Value submenu -->
                <mat-menu #valueMenu="matMenu" class="value-submenu">
                  <div class="value-panel" (click)="$event.stopPropagation()">
                    <div class="value-header">{{ prop.label }} {{ op.label }}</div>
                    @switch (prop.objectType) {
                      @case ('boolean') {
                        <div class="value-options">
                          <button mat-menu-item (click)="onAddStatement(prop, op.value, 'true')">
                            <mat-icon>check_box</mat-icon>
                            <span>true</span>
                          </button>
                          <button mat-menu-item (click)="onAddStatement(prop, op.value, 'false')">
                            <mat-icon>check_box_outline_blank</mat-icon>
                            <span>false</span>
                          </button>
                        </div>
                      }
                      @default {
                        <input
                          class="value-input"
                          type="text"
                          [(ngModel)]="newValue"
                          [placeholder]="getPlaceholder(prop.objectType)"
                          (keydown.enter)="onAddStatement(prop, op.value, newValue)" />
                        <button
                          mat-flat-button
                          color="primary"
                          class="value-apply"
                          [disabled]="!newValue?.trim()"
                          (click)="onAddStatement(prop, op.value, newValue)">
                          <mat-icon>check</mat-icon>
                          Apply
                        </button>
                      }
                    }
                  </div>
                </mat-menu>
              } @else {
                <!-- Exists/NotExists - no value needed, direct click -->
                <button mat-menu-item (click)="onAddStatement(prop, op.value, '')" class="operator-menu-item">
                  <span>{{ op.label }}</span>
                </button>
              }
            }
          </mat-menu>
        }

        @if (filteredProperties.length === 0) {
          <div class="no-results">No properties found</div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .statement-dialog {
        min-width: 300px;
        max-width: 380px;
        background: white;
        border-radius: 12px;
        padding: 8px 0;
      }

      ::ng-deep .operator-submenu {
        min-width: 200px;
      }

      ::ng-deep .value-submenu {
        min-width: 250px;
      }

      ::ng-deep .editor-submenu {
        min-width: 280px;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px 8px;
        color: rgba(0, 0, 0, 0.54);
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .section-header mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .statements-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 4px 20px 12px;
      }

      .statement-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 6px 4px 8px;
        border: 1px solid rgba(103, 58, 183, 0.3);
        border-radius: 12px;
        background: rgba(103, 58, 183, 0.06);
        cursor: pointer;
        font-size: 12px;
        line-height: 1.2;
        transition:
          border-color 0.15s ease,
          background-color 0.15s ease;
      }

      .statement-chip:hover {
        border-color: rgba(103, 58, 183, 0.5);
        background: rgba(103, 58, 183, 0.1);
      }

      .statement-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: rgba(103, 58, 183, 0.8);
        flex-shrink: 0;
      }

      .statement-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 180px;
        color: rgba(0, 0, 0, 0.8);
      }

      .remove-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        padding: 0;
        border: none;
        background: transparent;
        opacity: 0.5;
        flex-shrink: 0;
        cursor: pointer;
        border-radius: 50%;
      }

      .remove-btn:hover {
        opacity: 1;
        color: #f44336;
        background: rgba(244, 67, 54, 0.1);
      }

      .remove-btn mat-icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
        line-height: 12px;
      }

      .search-container {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      .search-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.5;
      }

      .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
        background: transparent;
      }

      .clear-search {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border: none;
        background: transparent;
        cursor: pointer;
        opacity: 0.5;
        padding: 0;
      }

      .clear-search:hover {
        opacity: 1;
      }

      .clear-search mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .property-list {
        max-height: 280px;
        overflow-y: auto;
        padding: 4px 0;
      }

      /* Style mat-menu-item buttons to look cleaner */
      .property-menu-item,
      .operator-menu-item {
        font-size: 14px;
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .property-menu-item:hover,
      .operator-menu-item:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .property-menu-item mat-icon,
      .operator-menu-item mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.7;
      }

      .value-panel {
        padding: 12px 16px;
      }

      .value-header {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
        margin-bottom: 8px;
      }

      .value-input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 14px;
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.12);
        outline: none;
        box-sizing: border-box;
        margin-bottom: 8px;
      }

      .value-input:focus {
        border-color: rgba(63, 81, 181, 0.5);
        box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
      }

      .value-apply {
        width: 100%;
      }

      .value-options {
        margin: 0 -16px;
      }

      .no-results {
        padding: 16px;
        text-align: center;
        color: rgba(0, 0, 0, 0.54);
        font-size: 14px;
      }

      .editor-panel {
        padding: 12px 16px;
        min-width: 240px;
      }

      .editor-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        font-weight: 500;
      }

      .editor-header mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.7;
      }

      .editor-fields {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }

      .editor-input {
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.12);
        outline: none;
        width: 100%;
        box-sizing: border-box;
      }

      .editor-input:focus {
        border-color: rgba(63, 81, 181, 0.5);
        box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
      }

      .editor-actions {
        display: flex;
        justify-content: flex-end;
        gap: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementDialogComponent {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialogRef = inject(MatDialogRef<StatementDialogComponent>);
  readonly data = inject<StatementDialogData>(MAT_DIALOG_DATA);

  @ViewChildren(MatMenuTrigger) menuTriggers!: QueryList<MatMenuTrigger>;

  propertyFilter = '';
  newValue = '';

  // Track edit state per statement
  private editStates = new Map<string, { operator: Operator; value: string }>();

  readonly operatorOptions: ChipSelectorOption[] = [
    { value: Operator.Equals, label: 'equals' },
    { value: Operator.NotEquals, label: 'does not equal' },
    { value: Operator.IsLike, label: 'is like' },
    { value: Operator.Matches, label: 'matches' },
    { value: Operator.Exists, label: 'exists' },
    { value: Operator.NotExists, label: 'does not exist' },
  ];

  readonly numericOperatorOptions: ChipSelectorOption[] = [
    { value: Operator.Equals, label: 'equals' },
    { value: Operator.NotEquals, label: 'does not equal' },
    { value: Operator.GreaterThan, label: 'greater than' },
    { value: Operator.GreaterThanEquals, label: 'greater or equal' },
    { value: Operator.LessThan, label: 'less than' },
    { value: Operator.LessThanEquals, label: 'less or equal' },
    { value: Operator.Exists, label: 'exists' },
    { value: Operator.NotExists, label: 'does not exist' },
  ];

  readonly booleanOptions: ChipSelectorOption[] = [
    { value: 'true', label: 'true' },
    { value: 'false', label: 'false' },
  ];

  get filteredProperties(): PropertyOption[] {
    if (!this.propertyFilter.trim()) {
      return this.data.properties;
    }
    const filter = this.propertyFilter.toLowerCase();
    return this.data.properties.filter(p => p.label.toLowerCase().includes(filter));
  }

  getPropertyIcon(type: PropertyType): string {
    return PROPERTY_TYPE_ICONS[type] ?? 'help_outline';
  }

  getOperatorOptions(type: PropertyType): ChipSelectorOption[] {
    if (type === 'integer' || type === 'decimal' || type === 'date') {
      return this.numericOperatorOptions;
    }
    return this.operatorOptions;
  }

  getPlaceholder(type: PropertyType): string {
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

  operatorNeedsValue(operator: string): boolean {
    return operator !== Operator.Exists && operator !== Operator.NotExists;
  }

  onAddStatement(prop: PropertyOption, operator: string, value: string): void {
    const statement: Partial<FilterChipData> = {
      resourceClassIri: this.data.resourceClass.iri,
      resourceClassLabel: this.data.resourceClass.label,
      propertyIri: prop.iri,
      propertyLabel: prop.label,
      propertyType: prop.objectType,
      operatorIri: operator,
      operatorLabel: this.getOperatorLabel(operator as Operator),
      value: value || null,
      valueLabel: value || '',
    };

    // Close all menus first, then apply - dialog stays open
    this.closeAllMenus();
    this.data.onStatementApply(statement);
    this.newValue = '';
    this.propertyFilter = '';
    this.cdr.markForCheck();
  }

  // Edit existing statement methods
  getEditOperator(stmt: FilterChipData): string {
    const editState = this.editStates.get(stmt.id);
    return editState?.operator ?? (stmt.operatorIri as Operator);
  }

  getEditValue(stmt: FilterChipData): string {
    const editState = this.editStates.get(stmt.id);
    return editState?.value ?? stmt.valueLabel;
  }

  showValueInputForStatement(stmt: FilterChipData): boolean {
    const op = this.getEditOperator(stmt) as Operator;
    return op !== Operator.Exists && op !== Operator.NotExists;
  }

  isEditValid(stmt: FilterChipData): boolean {
    const op = this.getEditOperator(stmt) as Operator;
    if (op === Operator.Exists || op === Operator.NotExists) {
      return true;
    }
    return !!this.getEditValue(stmt)?.trim();
  }

  onEditOperatorChange(stmt: FilterChipData, operator: string): void {
    const current = this.editStates.get(stmt.id) ?? {
      operator: stmt.operatorIri as Operator,
      value: stmt.valueLabel,
    };
    this.editStates.set(stmt.id, { ...current, operator: operator as Operator });
    this.cdr.markForCheck();
  }

  onEditValueChange(stmt: FilterChipData, value: string): void {
    const current = this.editStates.get(stmt.id) ?? {
      operator: stmt.operatorIri as Operator,
      value: stmt.valueLabel,
    };
    this.editStates.set(stmt.id, { ...current, value });
    this.cdr.markForCheck();
  }

  onEditApply(stmt: FilterChipData): void {
    const editState = this.editStates.get(stmt.id);
    const operator = editState?.operator ?? (stmt.operatorIri as Operator);
    const value = editState?.value ?? stmt.valueLabel;

    const updatedStatement: Partial<FilterChipData> = {
      id: stmt.id,
      resourceClassIri: stmt.resourceClassIri,
      resourceClassLabel: stmt.resourceClassLabel,
      propertyIri: stmt.propertyIri,
      propertyLabel: stmt.propertyLabel,
      propertyType: stmt.propertyType,
      operatorIri: operator,
      operatorLabel: this.getOperatorLabel(operator),
      value: value || null,
      valueLabel: value || '',
    };

    // Close all menus first, then apply - dialog stays open
    this.closeAllMenus();
    this.data.onStatementApply(updatedStatement);
    this.editStates.delete(stmt.id);
    this.cdr.markForCheck();
  }

  onRemoveStatement(statementId: string, event: Event): void {
    event.stopPropagation();
    // Call the callback function - don't close the dialog
    this.data.onStatementRemove(statementId);
    this.cdr.markForCheck();
  }

  private getOperatorLabel(operator: Operator): string {
    const found = [...this.operatorOptions, ...this.numericOperatorOptions].find(o => o.value === operator);
    return found?.label ?? operator;
  }

  private closeAllMenus(): void {
    this.menuTriggers?.forEach(trigger => trigger.closeMenu());
  }
}
