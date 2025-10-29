import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { combineLatest, distinctUntilChanged, map } from 'rxjs';
import { SearchStateService } from '../../service/search-state.service';

@Component({
  selector: 'app-order-by',
  imports: [
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    OverlayModule,
    AsyncPipe,
  ],
  templateUrl: './order-by.component.html',
  styleUrls: ['./order-by.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OrderByComponent {
  private searchService: SearchStateService = inject(SearchStateService);

  readonly TOOLTIP_TEXT = 'Search cannot be ordered by a URI property or a property that links to a resource.';

  @ViewChild('sortOrderSelectionList')
  sortOrderSelectionList!: MatSelectionList;

  orderByItems$ = this.searchService.orderByItems$.pipe(distinctUntilChanged());

  orderByDisabled$ = combineLatest([this.searchService.statementElements$, this.searchService.orderByItems$]).pipe(
    map(([statements, orderBylist]) => !orderBylist.length || !statements.length),
    distinctUntilChanged()
  );

  isOpen = false;

  drop(event: CdkDragDrop<string[]>) {
    const currentOrderByList = this.searchService.currentState.orderBy;
    if (!currentOrderByList) return;

    moveItemInArray(currentOrderByList, event.previousIndex, event.currentIndex);
    this.searchService.updateOrderBy(currentOrderByList);
  }

  onSelectionChange(event: MatSelectionListChange) {
    const currentOrderByList = this.searchService.currentState.orderBy;
    if (!currentOrderByList) return;

    event.options.forEach(option => {
      const selectedItem = currentOrderByList.find(item => item.id === option.value);
      if (selectedItem) {
        selectedItem.orderBy = option.selected;
      }
    });
    this.searchService.updateOrderBy(currentOrderByList);
  }
}
