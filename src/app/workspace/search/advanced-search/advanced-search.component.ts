import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SearchParams } from '@dasch-swiss/dsp-ui';
import { CacheService } from 'src/app/main/cache/cache.service';


@Component({
    selector: 'app-advanced-search',
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss']
})
export class AdvancedSearchComponent implements OnInit {

    loading: boolean = true;

    gravsearchQuery: string;

    searchParams: SearchParams;

    constructor(
        private _cache: CacheService,
        private _titleService: Title
    ) {
        this._titleService.setTitle('Advanced search');
    }

    ngOnInit() {

        // TODO: find another solution
        /* if (this._cache.has('gravsearch')) {
            // reload the results
            this._cache.get('gravsearch').subscribe(
                (cachedQuery: string) => {
                    this.gravsearchQuery = cachedQuery;
                    this.loading = false;
                },
                (error: any) => {
                    console.error(error);
                }
            );
        } */
    }

    doSearch(search: SearchParams) {
        // reset search params
        this.searchParams = undefined;
        // we can do the routing here or send the search param
        // to (resource) list view directly
        this.searchParams = search;
    }

    openResource(id: string) {
        // TODO: implement the redirection to the resource viewer
        console.log('resource id', id);
    }
}
