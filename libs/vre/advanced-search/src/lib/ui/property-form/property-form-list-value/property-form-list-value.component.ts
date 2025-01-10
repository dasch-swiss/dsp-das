import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuItem, MatMenuModule } from '@angular/material/menu';
import { Constants, ListNodeV2 } from '@dasch-swiss/dsp-js';
import { PropertyFormItem } from '../../../data-access/advanced-search-store/advanced-search-store.service';
import { ListItemComponent } from './list-item/list-item.component';

@Component({
  selector: 'dasch-swiss-property-form-list-value',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, ListItemComponent],
  templateUrl: './property-form-list-value.component.html',
  styleUrls: ['./property-form-list-value.component.scss'],
})
export class PropertyFormListValueComponent implements AfterViewInit {
  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    const isMenuOpen = this.menuItems && this.menuItems.length > 0;
    if (isMenuOpen) {
      this.onKeydown(event);
    }
  }

  @Input() list: ListNodeV2 | undefined = undefined;
  @Input() value: string | PropertyFormItem[] | undefined = undefined;

  @Output() emitValueChanged = new EventEmitter<string>();
  @ViewChildren(MatMenuItem) menuItems!: QueryList<MatMenuItem>;
  lastKeyPressTime: number = 0;
  buffer: string = '';

  constants = Constants;

  selectedItem: string | undefined = undefined;

  get sortedLabelList(): ListNodeV2[] | undefined {
    return this.list?.children.sort((a, b) => a.label.localeCompare(b.label));
  }

  ngAfterViewInit(): void {
    if (this.list && this.value && typeof this.value === 'string') {
      this.selectedItem = this.findItemById(this.list, this.value)?.label;
    }
  }

  onItemClicked(item: ListNodeV2) {
    this.selectedItem = item.label;
    this.emitValueChanged.emit(item.id);
  }

  findItemById(node: ListNodeV2, targetId: string): ListNodeV2 | undefined {
    if (node.id === targetId) {
      return node;
    }

    for (const child of node.children) {
      const found = this.findItemById(child, targetId);
      if (found) {
        return found;
      }
    }

    return undefined;
  }

  onKeydown(event: KeyboardEvent) {
    const currentTime = new Date().getTime();
    if (currentTime - this.lastKeyPressTime > 500) {
      this.buffer = '';
    }
    this.lastKeyPressTime = currentTime;
    this.buffer += event.key.toLowerCase();
    const matchingIndex = this.sortedLabelList!.findIndex(item => {
      return item.label.toLowerCase().startsWith(this.buffer);
    });
    if (matchingIndex !== -1) {
      const matchingMenuItem = this.menuItems.toArray()[matchingIndex];
      matchingMenuItem.focus();
    }
  }
}
