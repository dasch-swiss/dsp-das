import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-advanced-search-container',
    templateUrl: './advanced-search-container.component.html',
    styleUrls: ['./advanced-search-container.component.scss'],
})
export class AdvancedSearchContainerComponent implements OnInit {
    uuid: string;

    constructor(private _router: Router, private _route: ActivatedRoute) {}

    ngOnInit(): void {
        this.uuid = this._route.parent.snapshot.params.uuid;
    }

    onSearch(query: string): void {
        const route = `/search/gravsearch/${encodeURIComponent(query)}`;
        this._router.navigate([route]);
    }

    onBackClicked(): void {
        this._router.navigate(['/']);
    }
}
