import { Component, Input } from '@angular/core';
import { Dataset } from '@dasch-swiss/dsp-js';

@Component({
    selector: 'app-dataset-tab-view',
    templateUrl: './dataset-tab-view.component.html',
    styleUrls: ['./dataset-tab-view.component.scss']
})
export class DatasetTabViewComponent {

    // metadata input object
    @Input() metadata: Dataset;

    // number of datasets available for this project
    @Input() noOfDatasets: number;

    // metadata keys that we do not want to display
    excludeKeys = ['project', 'qualifiedAttribution'];

    // metadata keys that require specific format to display
    templateKeys = ['abstract', 'distribution', 'documentation', 'license', 'sameAs', ];

    // date keys from metadata object for formatting
    dateKeys = ['dateCreated', 'dateModified', 'datePublished'];
}
