import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { IriLabelPair } from '../../model';

/**
 * Simplified tree node for mockup purposes.
 * In production, this would use ListNodeV2 from @dasch-swiss/dsp-js
 */
export interface ListNode {
  iri: string;
  label: string;
  children?: ListNode[];
}

@Component({
  selector: 'app-list-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="list-selector">
      <input
        class="filter-input"
        type="text"
        [(ngModel)]="filterText"
        (ngModelChange)="onFilterChange()"
        placeholder="Search..." />

      <div class="list-container">
        @if (filteredNodes.length === 0) {
          <div class="empty-state">No items found</div>
        }
        @for (node of filteredNodes; track node.iri) {
          <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: node, depth: 0 }" />
        }

        <ng-template #nodeTemplate let-node="node" let-depth="depth">
          <div
            class="list-item"
            [class.selected]="selectedNode?.iri === node.iri"
            [style.padding-left.px]="12 + depth * 16"
            (click)="onSelect(node)">
            @if (node.children?.length) {
              <mat-icon class="expand-icon">chevron_right</mat-icon>
            } @else {
              <span class="expand-spacer"></span>
            }
            <span class="node-label">{{ node.label }}</span>
          </div>
          @if (node.children?.length && isExpanded(node)) {
            @for (child of node.children; track child.iri) {
              <ng-container *ngTemplateOutlet="nodeTemplate; context: { node: child, depth: depth + 1 }" />
            }
          }
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .list-selector {
        display: flex;
        flex-direction: column;
        max-height: 250px;
        min-width: 200px;
      }

      .filter-input {
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        background: rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0, 0, 0, 0.12);
        outline: none;
        margin-bottom: 8px;
      }

      .filter-input:focus {
        border-color: rgba(63, 81, 181, 0.5);
      }

      .list-container {
        overflow-y: auto;
        max-height: 200px;
      }

      .list-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 13px;
        border-radius: 4px;
        transition: background-color 0.1s ease;
      }

      .list-item:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .list-item.selected {
        background: rgba(103, 58, 183, 0.1);
        color: #673ab7;
      }

      .expand-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        opacity: 0.6;
      }

      .expand-spacer {
        width: 18px;
        height: 18px;
      }

      .node-label {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .empty-state {
        padding: 16px;
        text-align: center;
        color: rgba(0, 0, 0, 0.54);
        font-size: 13px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListSelectorComponent {
  @Input() nodes: ListNode[] = [];
  @Input() selectedNode: ListNode | null = null;
  @Input() rootNodeIri?: string;

  @Output() selectionChange = new EventEmitter<IriLabelPair>();

  filterText = '';
  expandedNodes = new Set<string>();

  get filteredNodes(): ListNode[] {
    if (!this.filterText.trim()) {
      return this.nodes;
    }
    return this.filterTree(this.nodes, this.filterText.toLowerCase());
  }

  onFilterChange(): void {
    // When filtering, expand all matching paths
    if (this.filterText.trim()) {
      this.expandAll(this.filteredNodes);
    }
  }

  isExpanded(node: ListNode): boolean {
    // Always expand if filtering
    if (this.filterText.trim()) return true;
    return this.expandedNodes.has(node.iri);
  }

  toggleExpand(node: ListNode, event: Event): void {
    event.stopPropagation();
    if (this.expandedNodes.has(node.iri)) {
      this.expandedNodes.delete(node.iri);
    } else {
      this.expandedNodes.add(node.iri);
    }
  }

  onSelect(node: ListNode): void {
    // Toggle expand if has children
    if (node.children?.length) {
      if (this.expandedNodes.has(node.iri)) {
        this.expandedNodes.delete(node.iri);
      } else {
        this.expandedNodes.add(node.iri);
      }
    }
    // Always emit selection
    this.selectionChange.emit({ iri: node.iri, label: node.label });
  }

  private filterTree(nodes: ListNode[], searchText: string): ListNode[] {
    const result: ListNode[] = [];

    for (const node of nodes) {
      const matchedChildren = node.children ? this.filterTree(node.children, searchText) : [];
      const isMatch = node.label.toLowerCase().includes(searchText);

      if (isMatch || matchedChildren.length > 0) {
        result.push({
          iri: node.iri,
          label: node.label,
          children: matchedChildren.length > 0 ? matchedChildren : node.children,
        });
      }
    }

    return result;
  }

  private expandAll(nodes: ListNode[]): void {
    for (const node of nodes) {
      if (node.children?.length) {
        this.expandedNodes.add(node.iri);
        this.expandAll(node.children);
      }
    }
  }
}
