import { Component, Input } from '@angular/core';
import { Attribution, Person, Organization, IId } from '@dasch-swiss/dsp-js';

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

    // return the type of agent to use correct template to display it
    setAgent (agent: Person | Organization | IId) {
        let atype = this.getAgentType(agent);
        if (atype) {
            this.currentAgent = agent;
        }
        else {
            this.currentAgent = this.subProperties[agent.id];
            atype = this.getAgentType(this.currentAgent);
        }
        return atype;
    }

    getAgentType (agent: Person | Organization | IId) {
        if (agent instanceof Person){
            return 'person';
        }
        else if (agent instanceof Organization){
            return 'organisation';
        } 
        return undefined;
    }

}
