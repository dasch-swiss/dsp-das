import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SearchParams } from '@dasch-swiss/dsp-ui';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

    searchParams: SearchParams;

    resIri: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router
    ) {
        this._route.paramMap.subscribe((params: Params) => {
            this.searchParams = {
                query: decodeURIComponent(params.get('q')),
                mode: 'fulltext'
            };
        });
    }

    ngOnInit() {
    }

    openResource(id: string) {
        this._router.navigate(['/resource/' + encodeURIComponent(id)]);
    }
}
