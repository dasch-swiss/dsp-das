import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-terms-tab-view',
    templateUrl: './terms-tab-view.component.html',
    styleUrls: ['./terms-tab-view.component.scss']
})
export class TermsTabViewComponent implements OnInit {

    @Input() conditions: string;
    @Input() license: object;

    constructor() { }

    ngOnInit(): void {
    }

}
