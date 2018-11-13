import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from '../../declarations/menu-item';

@Component({
    selector: 'app-navigation-item',
    templateUrl: './navigation-item.component.html',
    styleUrls: ['./navigation-item.component.scss']
})
export class NavigationItemComponent implements OnInit {

    @Input() item: MenuItem;

    constructor() {
    }

    ngOnInit() {
    }

}
