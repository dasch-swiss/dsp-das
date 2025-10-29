import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';
import { TranslateModule } from '@ngx-translate/core';
import { ReplaySubject } from 'rxjs';
import { NodeValue } from '../../../../model';

@Component({
  standalone: true,
  selector: 'app-list-value',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    TranslateModule,
  ],
  template: `
    <mat-form-field appearance="fill" class="dropdown">
      <mat-label>{{ 'pages.search.propertyFormListValue' | translate }}</mat-label>
      <input
        matInput
        [formControl]="valueFilterCtrl"
        type="text"
        aria-label="property-form-list-value"
        [matAutocomplete]="auto" />
      <mat-autocomplete
        #auto="matAutocomplete"
        [displayWith]="displayNode"
        (optionSelected)="onSelectionChange($event.option.value)">
        @for (node of filteredList$ | async; track trackByFn($index, node)) {
          <ng-container *ngTemplateOutlet="renderNode; context: { node: node, depth: 0 }" />
        }

        <ng-template #renderNode let-node="node" let-depth="depth">
          <mat-option [value]="node">
            <span [style.padding-left.px]="depth * 15">{{ node.label }}</span>
          </mat-option>
          @if (node.children?.length > 0) {
            @for (subchild of node.children; track trackByFn($index, subchild)) {
              <ng-container *ngTemplateOutlet="renderNode; context: { node: subchild, depth: depth + 1 }" />
            }
          }
        </ng-template>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    .dropdown {
      width: 44.2%;
      cursor: pointer;
      color: #737373;
    }
  `,
})
export class ListValueComponent implements OnInit {
  @Input({ required: true }) rootListNode!: ListNodeV2;
  @Input() selectedListNode?: NodeValue | undefined;

  @Output() emitValueChanged = new EventEmitter<string>();

  valueFilterCtrl: FormControl<string | null> = new FormControl<string | null>(null);

  constants = Constants;

  filteredList$: ReplaySubject<ListNodeV2[]> = new ReplaySubject<ListNodeV2[]>(1);

  get sortedLabelList(): ListNodeV2[] {
    return this.rootListNode ? [...this.rootListNode.children].sort((a, b) => a.label.localeCompare(b.label)) : [];
  }

  ngOnInit(): void {
    const list = [...(this.sortedLabelList || [])];
    this.filteredList$.next(list);
    this.valueFilterCtrl.valueChanges.subscribe((value: any) => {
      let filtered = [];
      if (value) {
        const label = typeof value === 'object' ? value.label : value.toLowerCase();
        filtered = this._filterItems(this.sortedLabelList || [], label);
      } else {
        filtered = [...(this.sortedLabelList || [])];
      }
      this.filteredList$.next(filtered);
    });
  }

  trackByFn = (index: number, item: any) => `${index}-${item.label}`;

  displayNode(node: any | null): string {
    return node ? node.label : '';
  }

  onSelectionChange(node: ListNodeV2) {
    this.emitValueChanged.emit(node.id);
  }
  private _filterItems(nodes: ListNodeV2[], searchText: string): ListNodeV2[] {
    return nodes
      .map(node => {
        const matchedChildren = this._filterItems(node.children || [], searchText);
        const isMatch = node.label.toLowerCase().includes(searchText);

        if (isMatch || matchedChildren.length > 0) {
          return {
            ...node,
            children: matchedChildren,
          };
        }
        return null;
      })
      .filter(node => node !== null) as ListNodeV2[];
  }
}
