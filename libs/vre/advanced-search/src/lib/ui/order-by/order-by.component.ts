import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderByItem, PropertyFormItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import {
    MatListModule,
    MatSelectionList,
    MatSelectionListChange,
} from '@angular/material/list';
import {
    CdkDragDrop,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    moveItemInArray,
} from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'dasch-swiss-order-by',
    standalone: true,
    imports: [CommonModule, CdkDrag, CdkDragHandle, CdkDropList, MatIconModule, MatListModule, OverlayModule],
    templateUrl: './order-by.component.html',
    styleUrls: ['./order-by.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderByComponent implements OnChanges {
    @Input() properties: PropertyFormItem[] | null = [];
    @Input() orderByDisabled: boolean | null = false;

    @Output() emitPropertyOrderByChanged = new EventEmitter<OrderByItem[]>();

    @ViewChild('sortOrderSelectionList')
    sortOrderSelectionList!: MatSelectionList;

    sortOrderList: OrderByItem[] = [];
    isOpen = false;

    ngOnChanges() {
        if (this.properties) {
            console.log('changes properties:', this.properties);
            this.sortOrderList = this.properties.map((prop) => {
                return {
                    id: prop.id,
                    label: prop.selectedProperty?.label || '',
                    orderBy: false,
                };
            });
            console.log('sortOrderList:', this.sortOrderList);
        }
    }

    drop(event: CdkDragDrop<string[]>) {
        if (!this.sortOrderList) return;
        moveItemInArray(
            this.sortOrderList,
            event.previousIndex,
            event.currentIndex
        );

        // create copy of sortOrderList
        // yeet any items that are not selected
        // emit the copy
        const copy = [...this.sortOrderList];
        const filtered = copy.filter((item) => item.orderBy === true);
        this.emitPropertyOrderByChanged.emit(filtered);
        // console.log('items:', this.sortOrderList);
        // console.log('filtered:', filtered);

    }

    onSelectionChange(event: MatSelectionListChange) {
        event.options.forEach((option) => {
            const selectedItem = this.sortOrderList?.find(
                (item) => item.id === option.value
            );
            if (selectedItem) {
                selectedItem.orderBy = option.selected;
            }
        });

        // create copy of sortOrderList
        // yeet any items that are not selected
        // emit the copy
        const copy = [...this.sortOrderList];
        const filtered = copy.filter((item) => item.orderBy === true);
        this.emitPropertyOrderByChanged.emit(filtered);
        // console.log('items:', this.sortOrderList);
        // console.log('filtered:', filtered);
    }

}
