import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-dataset-tab-view',
    templateUrl: './dataset-tab-view.component.html',
    styleUrls: ['./dataset-tab-view.component.scss']
})
export class DatasetTabViewComponent implements OnInit {

    @Input() metadata: object;

    excludeKeys = ['project', 'qualifiedAttribution'];
    templateKeys = ['distribution', 'license', 'sameAs', 'dateCreated', 'dateModified', 'datePublished'];
    dateKeys = ['dateCreated', 'dateModified', 'datePublished'];

    constructor() { }

    ngOnInit(): void {
    }

}
