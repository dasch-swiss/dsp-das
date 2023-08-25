import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-advanced-search-container',
    templateUrl: './advanced-search-container.component.html',
    styleUrls: ['./advanced-search-container.component.scss'],
})
export class AdvancedSearchContainerComponent {

    uuid: string;

    constructor(private _router: Router) { }

    // ngOnInit(): void {
    //     this.uuid = history.state.uuid;
    // }

    onSearch(query: string): void {
        console.log(query);
        const route = `/search/gravsearch/${encodeURIComponent(query)}`;
        this._router.navigate([route]);
    }

    onBackClicked(): void {
        this._router.navigate(['/']);
    }
}
