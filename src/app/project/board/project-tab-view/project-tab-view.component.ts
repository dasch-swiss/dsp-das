import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-project-tab-view',
    templateUrl: './project-tab-view.component.html',
    styleUrls: ['./project-tab-view.component.scss']
})
export class ProjectTabViewComponent implements OnInit {

    @Input() metadata: object;

    excludeKeys = ['contactPoint'];

    dateKeys = ['startDate', 'endDate'];

    constructor() { }

    ngOnInit(): void {
    }

}
