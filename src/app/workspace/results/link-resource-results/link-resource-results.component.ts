import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { KnoraApiConnection, ReadResource, ReadResourceSequence } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';

@Component({
    selector: 'app-link-resource-results',
    templateUrl: './link-resource-results.component.html',
    styleUrls: ['./link-resource-results.component.scss']
})
export class LinkResourceResultsComponent implements OnInit {
    @Input() parentResource: ReadResource;
    @Input() propDef: string;
    @Input() resourceClassDef: string;
    @Input() resources: ReadResource[];
    @Input() searchTerm: string;

    @Output() closeDialog: EventEmitter<ReadResource[]> = new EventEmitter<ReadResource[]>();

    selectedLinkResources: ReadResource[];
    offset = 0;
    showLoadMoreButton = true;

    constructor(@Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection) { }

    ngOnInit(): void {
        // console.log('parentResource: ', this.parentResource);
        // console.log('propDef: ', this.propDef);
        // console.log('resourceClassDef: ', this.resourceClassDef);
        // console.log('resources: ', this.resources);
        console.log('searchTerm: ', this.searchTerm);
        this.selectedLinkResources = [];
    }

    selectResource(resourceToAdd: ReadResource) {
        this.selectedLinkResources.push(resourceToAdd);
        console.log('selectedLinkResources: ', this.selectedLinkResources);
    }

    removeResource(resourceToRemove: ReadResource) {
        this.selectedLinkResources = this.selectedLinkResources.filter(res => res !== resourceToRemove);
        console.log('selectedLinkResources: ', this.selectedLinkResources);
    }

    loadMore() {
        const resultsListLength = this.resources.length;
        this.searchTerm = 'tes'; // todo: don't hardcode this
        this.offset++;
        this._dspApiConnection.v2.search.doSearchByLabel(
            this.searchTerm, this.offset, { limitToResourceClass: this.resourceClassDef }).subscribe(
            (response: ReadResourceSequence) => {
                this.resources = this.resources.concat(response.resources);
                // create method in js-lib 'doSearchByLabelCount' to return the count and show/hide the load more button if there are no more results
                // for now, use this hack
                if (resultsListLength === this.resources.length) {
                    this.showLoadMoreButton = false;
                }
            });
    }

}
