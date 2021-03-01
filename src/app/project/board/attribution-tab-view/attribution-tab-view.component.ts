import { Component, Input } from '@angular/core';
import { Attribution, IId, Organization, Person } from '@dasch-swiss/dsp-js';
import { DatasetMetadataService } from '../dataset-metadata.service';

@Component({
    selector: 'app-attribution-tab-view',
    templateUrl: './attribution-tab-view.component.html',
    styleUrls: ['./attribution-tab-view.component.scss']
})
export class AttributionTabViewComponent {
    // attribution input
    @Input() attributions: Attribution[];

    @Input() subProperties: Object;

    currentAgent: Person | Organization | IId;

    constructor(private _datasetMetadataService: DatasetMetadataService) {
    }

    // return the type of agent to use correct template to display it
    setAgent (agent: Person | Organization | IId): string {
        let atype = this._datasetMetadataService.getContactType(agent);
        if (atype) {
            this.currentAgent = agent;
            return atype;
        }
        this.currentAgent = this.subProperties[agent.id];
        atype = this._datasetMetadataService.getContactType(this.currentAgent);
        return atype;
    }
}
