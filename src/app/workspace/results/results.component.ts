import { SearchParams, FilteredResources } from '.yalc/@dasch-swiss/dsp-ui/public-api';
import { Component, OnChanges, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

    searchParams: SearchParams;

    resIri: string;

    resourceIri: string;

    // display single resource or intermediate page in case of multiple selection
    multipleResources: FilteredResources;
    viewMode: 'single' | 'intermediate' | 'compare' = 'single';

    selectedResources: FilteredResources;

    // number of all results
    numberOfAllResults: number;

    // search params
    searchQuery: string;
    searchMode: 'fulltext' | 'gravsearch';

    loading = true;

    constructor(
        private _route: ActivatedRoute,
        private _titleService: Title
    ) {

        this._route.paramMap.subscribe((params: Params) => {
            this.searchQuery = decodeURIComponent(params.get('q'));
            this.searchMode = (decodeURIComponent(params.get('mode')) === 'fulltext' ? 'fulltext' : 'gravsearch');

            this.searchParams = {
                query: this.searchQuery,
                mode: this.searchMode
            };
            // get the project iri if exists
            if (params.get('project')) {
                this.searchParams.filter = {
                    limitToProject: decodeURIComponent(params.get('project'))
                };
            }

        });

        // set the page title
        this._titleService.setTitle('Search results for ' + this.searchParams.mode + ' search');
    }

    ngOnInit() {
        // this.selectedResources = {
        //     count: 0,
        //     resListIndex: [],
        //     resInfo: [],
        //     selectionType: 'single'
        // };
        console.warn('on changes', this.selectedResources);

    }

    // openResource(id: string) {
    //     this.viewMode = 'single';
    //     // this.multipleResources = undefined;
    //     this.resourceIri = id;
    // }

    openSelectedResources(res: FilteredResources) {
        this.selectedResources = res;

        if (!res || res.count <= 1) {
            this.viewMode = 'single';
        } else {
            if (this.viewMode !== 'compare') {
                this.viewMode = ((res && res.count > 0) ? 'intermediate' : 'single');
            }
        }

        this.loading = false;


        // if (!res || res.count === 0) {
        //     // reset the resource view
        //     this.resourceIri = undefined;
        //     this.selectedResources = undefined;

        // } else if (res.count === 1) {
        //     // open one resource
        //     this.resourceIri = res.resInfo[0].id;
        // } else {
        //     // open intermediate view if viewMode is not 'compare'
        //     if (this.viewMode !== 'compare' && res) {

        //         this.viewMode = ((res && res.count > 0) ? 'intermediate' : 'single');

        //         this.multipleResources = (this.viewMode !== 'single' ? res : undefined);
        //     } else {
        //         this.multipleResources = res;
        //     }

        // }
    }

    // this funtion is called when 'withMultipleSelection' is true and
    // multiple resources are selected for comparision
    // openMultipleResources(resources: FilteredResources) {

    //     if (this.viewMode !== 'compare' && resources) {

    //         this.viewMode = ((resources && resources.count > 0) ? 'intermediate' : 'single');

    //         this.multipleResources = (this.viewMode !== 'single' ? resources : undefined);
    //     }


    // }

}
