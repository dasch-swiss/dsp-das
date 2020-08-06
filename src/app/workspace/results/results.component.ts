import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { SearchParams } from '@dasch-swiss/dsp-ui';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

    searchParams: SearchParams;

    resIri: string;

    constructor() {
    }

    ngOnInit() {
    }

    openResource(id: string) {
        // TODO: implement the redirection to the resource viewer
        console.log('open ', id);
    }

    doSearch(search: SearchParams) {
        // reset search params
        this.searchParams = undefined;
        // we can do the routing here or send the search param
        // to (resource) list view directly
        this.searchParams = search;
    }

}
