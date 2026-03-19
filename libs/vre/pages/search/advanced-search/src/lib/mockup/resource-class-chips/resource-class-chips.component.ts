import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ResourceClassData } from '../../model';
import { PropertyOption } from '../editor-panel/editor-panel.component';
import { FilterChipData, RESOURCE_CLASS_COLORS } from '../models';
import { ResourceClassChipComponent } from '../resource-class-chip/resource-class-chip.component';

@Component({
  selector: 'app-resource-class-chips',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, ResourceClassChipComponent],
  template: `
    <div class="resource-class-row" #containerRef>
      @for (rc of visibleClasses; track rc.iri) {
        <app-resource-class-chip
          [resourceClass]="rc"
          [properties]="getPropertiesForClass(rc.iri)"
          [statements]="getStatementsForClass(rc.iri)"
          [isSelected]="isSelected(rc.iri)"
          (selectClass)="onSelect(rc)"
          (deselectClass)="onDeselect(rc.iri)"
          (statementApply)="onStatementApply($event)"
          (statementRemove)="onStatementRemove($event)" />
      }

      @if (hasMore) {
        <div class="resource-chip more" [matMenuTriggerFor]="moreMenu" [style.background-color]="unselectedColor">
          <span class="chip-label">More (+{{ hiddenCount }})</span>
          <mat-icon class="expand-icon">expand_more</mat-icon>
        </div>
        <mat-menu #moreMenu="matMenu">
          @for (rc of hiddenClasses; track rc.iri) {
            <button
              mat-menu-item
              (click)="onSelect(rc)"
              [class.selected-menu-item]="isSelected(rc.iri)"
              [class.has-statements]="hasStatementsForClass(rc.iri)">
              <mat-icon>{{ rc.icon }}</mat-icon>
              <span>{{ rc.label }}</span>
              @if (hasStatementsForClass(rc.iri)) {
                <mat-icon class="indicator">filter_list</mat-icon>
              }
            </button>
          }
        </mat-menu>
      }

      @if (hasAnySelection) {
        <button class="clear-button" (click)="onClearAll()" title="Clear all selections">
          <mat-icon>restart_alt</mat-icon>
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        overflow: hidden;
      }

      .resource-class-row {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        gap: 8px;
        overflow: hidden;
      }

      .resource-chip.more {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 8px 6px 12px;
        border-radius: 16px;
        font-size: 13px;
        line-height: 1.4;
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.08);
        flex-shrink: 0;
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .resource-chip.more:hover {
        border-color: rgba(0, 0, 0, 0.2);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .chip-label {
        white-space: nowrap;
      }

      .expand-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.7;
      }

      .selected-menu-item {
        background-color: rgba(103, 58, 183, 0.08);
      }

      .has-statements .indicator {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: rgba(103, 58, 183, 0.8);
        margin-left: auto;
      }

      .clear-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        background: rgba(0, 0, 0, 0.08);
        cursor: pointer;
        border-radius: 50%;
        padding: 0;
        opacity: 0.6;
        flex-shrink: 0;
        transition:
          opacity 0.15s,
          background-color 0.15s;
      }

      .clear-button:hover {
        opacity: 1;
        background-color: rgba(244, 67, 54, 0.15);
      }

      .clear-button mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceClassChipsComponent implements AfterViewInit, OnDestroy, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() resourceClasses: ResourceClassData[] = [];
  @Input() selectedClasses: Set<string> = new Set();
  @Input() statements: FilterChipData[] = [];
  @Input() propertiesByClass: Map<string, PropertyOption[]> = new Map();

  @Output() classSelect = new EventEmitter<ResourceClassData>();
  @Output() classDeselect = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() statementApply = new EventEmitter<Partial<FilterChipData>>();
  @Output() statementRemove = new EventEmitter<string>();

  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef<HTMLElement>;

  readonly unselectedColor = RESOURCE_CLASS_COLORS.unselected;
  readonly selectedColor = RESOURCE_CLASS_COLORS.selected;

  private resizeObserver?: ResizeObserver;
  private containerWidth = 0;
  private maxVisibleCount = 0; // Start with 0, will be calculated

  // Estimated chip width (average)
  private readonly CHIP_GAP = 8;
  private readonly MORE_CHIP_WIDTH = 110;
  private readonly CLEAR_BUTTON_WIDTH = 40;
  private readonly AVG_CHIP_WIDTH = 140; // Slightly larger estimate to be safe

  ngAfterViewInit(): void {
    // Initial measurement
    this.containerWidth = this.containerRef.nativeElement.offsetWidth;
    this.calculateMaxVisible();
    this.cdr.markForCheck();

    // Watch for resize
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.containerWidth = entry.contentRect.width;
        this.calculateMaxVisible();
        this.cdr.markForCheck();
      }
    });
    this.resizeObserver.observe(this.containerRef.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resourceClasses'] || changes['selectedClasses'] || changes['statements']) {
      this.calculateMaxVisible();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private calculateMaxVisible(): void {
    if (this.containerWidth === 0 || this.resourceClasses.length === 0) return;

    // Reserve space for More chip and Clear button if needed
    const hasSelection = this.selectedClasses.size > 0 || this.statements.length > 0;
    const reservedWidth =
      this.MORE_CHIP_WIDTH + this.CHIP_GAP + (hasSelection ? this.CLEAR_BUTTON_WIDTH + this.CHIP_GAP : 0);

    const availableWidth = this.containerWidth - reservedWidth;
    const chipWidthWithGap = this.AVG_CHIP_WIDTH + this.CHIP_GAP;

    // Calculate how many chips can fit
    let maxFit = Math.floor(availableWidth / chipWidthWithGap);

    // Ensure at least 1 chip is visible
    maxFit = Math.max(1, maxFit);

    // If all chips fit, no need for More chip - recalculate without reserved space for More chip
    if (maxFit >= this.sortedClasses.length) {
      const fullAvailableWidth =
        this.containerWidth - (hasSelection ? this.CLEAR_BUTTON_WIDTH + this.CHIP_GAP : 0);
      maxFit = Math.floor(fullAvailableWidth / chipWidthWithGap);
      maxFit = Math.max(maxFit, this.sortedClasses.length);
    }

    this.maxVisibleCount = maxFit;
  }

  /**
   * Sort classes: selected first (alphabetically), then unselected (alphabetically)
   */
  get sortedClasses(): ResourceClassData[] {
    const selected: ResourceClassData[] = [];
    const unselected: ResourceClassData[] = [];

    for (const rc of this.resourceClasses) {
      if (this.isSelected(rc.iri)) {
        selected.push(rc);
      } else {
        unselected.push(rc);
      }
    }

    // Sort each group alphabetically by label
    selected.sort((a, b) => a.label.localeCompare(b.label));
    unselected.sort((a, b) => a.label.localeCompare(b.label));

    return [...selected, ...unselected];
  }

  get visibleClasses(): ResourceClassData[] {
    // If not yet calculated, show nothing (will update after AfterViewInit)
    if (this.maxVisibleCount === 0) return [];
    return this.sortedClasses.slice(0, this.maxVisibleCount);
  }

  get hiddenClasses(): ResourceClassData[] {
    if (this.maxVisibleCount === 0) return this.sortedClasses;
    return this.sortedClasses.slice(this.maxVisibleCount);
  }

  get hasMore(): boolean {
    return this.maxVisibleCount > 0 && this.sortedClasses.length > this.maxVisibleCount;
  }

  get hiddenCount(): number {
    return this.sortedClasses.length - this.maxVisibleCount;
  }

  get hasAnySelection(): boolean {
    return this.selectedClasses.size > 0 || this.statements.length > 0;
  }

  isSelected(classIri: string): boolean {
    return this.selectedClasses.has(classIri);
  }

  hasStatementsForClass(classIri: string): boolean {
    return this.statements.some(s => s.resourceClassIri === classIri);
  }

  getStatementsForClass(classIri: string): FilterChipData[] {
    return this.statements.filter(s => s.resourceClassIri === classIri);
  }

  getPropertiesForClass(classIri: string): PropertyOption[] {
    return this.propertiesByClass.get(classIri) ?? [];
  }

  onSelect(rc: ResourceClassData): void {
    this.classSelect.emit(rc);
  }

  onDeselect(classIri: string): void {
    this.classDeselect.emit(classIri);
  }

  onClearAll(): void {
    this.clearAll.emit();
  }

  onStatementApply(statement: Partial<FilterChipData>): void {
    this.statementApply.emit(statement);
  }

  onStatementRemove(statementId: string): void {
    this.statementRemove.emit(statementId);
  }
}
