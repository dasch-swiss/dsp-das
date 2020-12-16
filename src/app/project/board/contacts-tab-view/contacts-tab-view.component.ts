import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-contacts-tab-view',
    templateUrl: './contacts-tab-view.component.html',
    styleUrls: ['./contacts-tab-view.component.scss']
})
export class ContactsTabViewComponent implements OnInit {

    @Input() contactDetails: object;

    constructor() { }

    ngOnInit(): void {
    }

}
