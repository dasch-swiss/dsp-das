import { Component, Input, OnInit } from '@angular/core';
import { IId, Organization, Person } from '@dasch-swiss/dsp-js';

@Component({
    selector: 'app-contacts-tab-view',
    templateUrl: './contacts-tab-view.component.html',
    styleUrls: ['./contacts-tab-view.component.scss']
})
export class ContactsTabViewComponent implements OnInit{
    // contact details
    @Input() contactDetails: Person[] | Organization[] | IId[];

    @Input() subProperties: Object;

    contactsList = [];
    contactType: string;

    ngOnInit() {

        if (this.contactDetails) {
            // check which type of array is present
            this.contactType = this.getContactType(this.contactDetails[0]);
            
            // if contactType is person or organization
            if (this.contactType) {
                this.contactsList = this.contactDetails;
            }
            else {
                // if contactType is undefined, it means it contains the array of IId objects
                for (let contact of this.contactDetails) {
                    this.contactsList.push(this.subProperties[contact.id]);
                }
                this.contactType = this.getContactType(this.contactsList[0]);
            }
        }
    }

    getContactType(obj: Person | Organization | IId) {
        if (obj instanceof Person) {
            return 'person';
        }
        else if (obj instanceof Organization) {
            return 'organization';
        }
        return undefined;
    }
}
