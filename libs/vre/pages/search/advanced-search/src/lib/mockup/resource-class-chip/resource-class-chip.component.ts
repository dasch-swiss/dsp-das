import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResourceClassData } from '../../model';
import { PropertyOption } from '../editor-panel/editor-panel.component';
import { FilterChipData, RESOURCE_CLASS_COLORS } from '../models';
import { StatementDialogComponent, StatementDialogData } from '../statement-dialog/statement-dialog.component';

@Component({
  selector: 'app-resource-class-chip',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div
      class="resource-chip"
      [class.selected]="isSelected"
      [class.has-statements]="hasStatements"
      [class.dialog-open]="dialogOpen"
      [style.background-color]="chipColor"
      [matTooltip]="statementsTooltip"
      [matTooltipDisabled]="!hasStatements"
      matTooltipPosition="above"
      (click)="onChipClick($event)">
      <mat-icon class="chip-icon">{{ resourceClass.icon }}</mat-icon>
      <span class="chip-label">{{ resourceClass.label }}</span>

      @if (hasStatements) {
        <!-- Has statements: show tune icon to edit filters -->
        <mat-icon
          class="action-icon filter-icon"
          (click)="onActionIconClick($event)"
          matTooltip="Edit filters"
          matTooltipPosition="above">
          tune
        </mat-icon>
      } @else if (isSelected) {
        <!-- Selected but no statements: show filter_list icon to add filters -->
        <mat-icon
          class="action-icon add-icon"
          (click)="onActionIconClick($event)"
          matTooltip="Add filter"
          matTooltipPosition="above">
          filter_list
        </mat-icon>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-block;
        flex-shrink: 0;
      }

      .resource-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px 6px 10px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.4;
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.08);
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .resource-chip:hover {
        border-color: rgba(0, 0, 0, 0.2);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .resource-chip.selected {
        border-color: rgba(103, 58, 183, 0.3);
      }

      .resource-chip.has-statements {
        border-color: rgba(103, 58, 183, 0.5);
      }

      .resource-chip.dialog-open {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      .chip-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        opacity: 0.7;
        flex-shrink: 0;
      }

      .chip-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 150px;
      }

      .action-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        cursor: pointer;
        border-radius: 50%;
        transition:
          background-color 0.15s ease,
          color 0.15s ease;
      }

      .filter-icon {
        color: #673ab7;
      }

      .filter-icon:hover {
        background-color: rgba(103, 58, 183, 0.15);
      }

      .add-icon {
        color: rgba(0, 0, 0, 0.5);
      }

      .add-icon:hover {
        color: #673ab7;
        background-color: rgba(103, 58, 183, 0.1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceClassChipComponent implements OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(MatDialog);

  @Input({ required: true }) resourceClass!: ResourceClassData;
  @Input() properties: PropertyOption[] = [];
  @Input() statements: FilterChipData[] = [];
  @Input() isSelected = false;

  @Output() selectClass = new EventEmitter<void>();
  @Output() deselectClass = new EventEmitter<void>();
  @Output() statementApply = new EventEmitter<Partial<FilterChipData>>();
  @Output() statementRemove = new EventEmitter<string>();

  dialogOpen = false;
  private dialogRef: MatDialogRef<StatementDialogComponent> | null = null;

  readonly unselectedColor = RESOURCE_CLASS_COLORS.unselected;
  readonly selectedColor = RESOURCE_CLASS_COLORS.selected;

  ngOnChanges(changes: SimpleChanges): void {
    // Update dialog data when statements change
    if (changes['statements'] && this.dialogRef) {
      this.dialogRef.componentInstance.data.statements = this.statements;
      this.dialogRef.componentInstance['cdr'].markForCheck();
    }
  }

  get chipColor(): string {
    // Purple if active, grey if inactive
    return this.isSelected ? this.selectedColor : this.unselectedColor;
  }

  get hasStatements(): boolean {
    return this.statements.length > 0;
  }

  get statementsTooltip(): string {
    if (!this.hasStatements) return '';
    return this.statements
      .map(s => {
        if (s.valueLabel) {
          return `${s.propertyLabel} ${s.operatorLabel} "${s.valueLabel}"`;
        }
        return `${s.propertyLabel} ${s.operatorLabel}`;
      })
      .join('\n');
  }

  onChipClick(event: Event): void {
    // Toggle active state (statements are independent data)
    if (this.isSelected) {
      this.deselectClass.emit();
    } else {
      this.selectClass.emit();
    }
  }

  onActionIconClick(event: MouseEvent): void {
    // Stop propagation so chip click doesn't fire
    event.stopPropagation();
    this.openStatementDialog(event);
  }

  private openStatementDialog(event: MouseEvent): void {
    const dialogData: StatementDialogData = {
      statements: this.statements,
      properties: this.properties,
      resourceClass: this.resourceClass,
      onStatementApply: (statement: Partial<FilterChipData>) => {
        this.statementApply.emit(statement);
      },
      onStatementRemove: (statementId: string) => {
        this.statementRemove.emit(statementId);
      },
    };

    this.dialogOpen = true;
    this.cdr.markForCheck();

    // Calculate position - open below the click point, adjust if too close to edges
    const dialogWidth = 350;
    const dialogHeight = 400; // Approximate max height
    const padding = 8;

    let left = event.clientX;
    let top = event.clientY + padding;

    // Adjust if too close to right edge
    if (left + dialogWidth > window.innerWidth - padding) {
      left = window.innerWidth - dialogWidth - padding;
    }

    // Adjust if too close to bottom edge
    if (top + dialogHeight > window.innerHeight - padding) {
      top = event.clientY - dialogHeight - padding;
    }

    // Ensure minimum left/top
    left = Math.max(padding, left);
    top = Math.max(padding, top);

    this.dialogRef = this.dialog.open(StatementDialogComponent, {
      data: dialogData,
      position: {
        top: `${top}px`,
        left: `${left}px`,
      },
      hasBackdrop: true,
      backdropClass: 'transparent-backdrop',
      panelClass: 'statement-dialog-panel',
      autoFocus: false,
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogOpen = false;
      this.dialogRef = null;
      this.cdr.markForCheck();
    });
  }
}
