import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, distinctUntilChanged, map, tap } from 'rxjs';
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

  readonly TOOLTIP_TEXT = 'Search cannot be ordered by a URI property or a property that links to a resource.';

  @ViewChild('sortOrderSelectionList')
  sortOrderSelectionList!: MatSelectionList;

  orderByList$ = this.searchService.propertiesOrderBy$.pipe(distinctUntilChanged());

  orderByDisabled$ = combineLatest([this.searchService.propertyForms$, this.searchService.propertiesOrderBy$]).pipe(
    map(([propertyFormList, orderBylist]) => !orderBylist.length || !propertyFormList.length),
    distinctUntilChanged()
  );

  isOpen = false;

  drop(event: CdkDragDrop<string[]>) {
    const currentOrderByList = this.searchService.currentState.propertiesOrderBy;
    if (!currentOrderByList) return;

    moveItemInArray(currentOrderByList, event.previousIndex, event.currentIndex);
    this.searchService.updatePropertyOrderBy(currentOrderByList);
  }

  onSelectionChange(event: MatSelectionListChange) {
    const currentOrderByList = this.searchService.currentState.propertiesOrderBy;
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
