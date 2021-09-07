import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ListNodeV2 } from '@dasch-swiss/dsp-js';
import { MatMenu } from '@angular/material/menu';

@Component({
    selector: 'app-search-display-list',
    templateUrl: './search-display-list.component.html',
    styleUrls: ['./search-display-list.component.scss']
})
export class SearchDisplayListComponent {

    @Input() children: ListNodeV2[];

    @Output() selectedNode: EventEmitter<ListNodeV2> = new EventEmitter<ListNodeV2>();

    @ViewChild('childMenu', { static: true }) public childMenu: MatMenu;

    constructor() {
    }

    setValue(item: ListNodeV2) {
        this.selectedNode.emit(item);
    }

}
