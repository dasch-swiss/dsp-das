import { Component, Input, OnInit } from '@angular/core';
import { Organization, Person } from '@dasch-swiss/dsp-js';


@Component({
    selector: 'app-person-template',
    templateUrl: './person-template.component.html',
    styleUrls: ['./person-template.component.scss']
})
export class PersonTemplateComponent implements OnInit {
    // input parameter
    @Input() person: Person;

    @Input() subProperties: Object;

    organizationList = [];

    ngOnInit() {
        // check type
        let isOrganizationType: boolean = false;
        if (this.person.memberOf[0] instanceof Organization){
            isOrganizationType = true;
            this.organizationList = this.person.memberOf;
        }

        if (!isOrganizationType) {
            for (let entry of this.person.memberOf) {
                this.organizationList.push(this.subProperties[entry.id]);
            }
        }
    }
}
