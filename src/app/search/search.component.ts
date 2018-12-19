import { Component, OnInit } from '@angular/core';
import { MenuItem } from '../main/declarations/menu-item';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

    loading: boolean;
    error: boolean;

    // for the sidenav
    open: boolean = true;

    searchQuery: string;
    searchMode: string;

    navigation: MenuItem[] = [
        {
            label: 'Fulltext',
            route: 'fulltext',
            icon: 'search'
        },
        {
            label: 'Extended',
            route: 'extended',
            icon: 'find_in_page'
        },
        {
            label: 'Faceted',
            route: 'faceted',
            icon: 'filter_list',
        },
        {
            label: 'Gravsearch',
            route: 'gravsearch',
            icon: 'code'
        }
    ];

    constructor() { }

    ngOnInit() {
    }

}
