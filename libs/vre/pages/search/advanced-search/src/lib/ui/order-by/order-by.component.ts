import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { PropertyFormManager } from '../../service/property-form.manager';
import { SearchStateService } from '../../service/search-state.service';

@Component({
  selector: 'app-order-by',
  standalone: true,
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    OverlayModule,
  ],
  templateUrl: './order-by.component.html',
  styleUrls: ['./order-by.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderByComponent {
  private searchService = inject(SearchStateService);
  private _propertyFormManager = inject(PropertyFormManager);

  orderByList$ = this.searchService.propertyForms$.pipe(
    map(propertyFormList => {
      const nonEmptyPropertyForms = propertyFormList.filter(propertyFormItem => propertyFormItem.selectedProperty);
      return nonEmptyPropertyForms.filter(prop => {
        return this._propertyFormManager.isPropertyFormItemValid(prop);
      });
    }),
    distinctUntilChanged()
  );

  orderByDisabled$ = combineLatest([this.searchService.propertyForms$, this.searchService.propertiesOrderByList$]).pipe(
    map(([propertyFormList, orderBylist]) => !orderBylist.length || !propertyFormList.length),
    distinctUntilChanged()
  );

  @ViewChild('sortOrderSelectionList')
  sortOrderSelectionList!: MatSelectionList;

  isOpen = false;
  tooltipText = 'Search cannot be ordered by a URI property or a property that links to a resource.';

  drop(event: CdkDragDrop<string[]>) {
    const currentOrderByList = this.searchService.get(state => state.propertiesOrderByList);
    if (!currentOrderByList) return;

    moveItemInArray(currentOrderByList, event.previousIndex, event.currentIndex);

    this.searchService.updatePropertyOrderBy(currentOrderByList);
  }

  onSelectionChange(event: MatSelectionListChange) {
    const currentOrderByList = this.searchService.get(state => state.propertiesOrderByList);
    if (!currentOrderByList) return;

    event.options.forEach(option => {
      const selectedItem = currentOrderByList.find(item => item.id === option.value);
      if (selectedItem) {
        selectedItem.orderBy = option.selected;
      }
    });

    this.searchService.updatePropertyOrderBy(currentOrderByList);
  }
}
