import { Component, Input } from '@angular/core';
import { Organization } from '@dasch-swiss/dsp-js';

@Component({
    selector: 'app-organisation-template',
    template: `
        <div>
            
            <h4 *ngFor="let name of organisation.name">
                <p> {{ organisation.name }} </p>
            </h4>
            
            <div *ngIf="organisation.url">
                <h4>URL(s):</h4>
                <p class="add-margin-left"  *ngFor="let entry of organisation.url">
                    <a href="{{ entry.url }}" target="_blank"> {{ entry.url }} </a>
                </p>
            </div>

            <div *ngIf="organisation.email" class="email">
                <h4>Email:</h4>
                <p class="add-margin-left">
                    <a href="mailto:{{ organisation.email }}"> {{ organisation.email }} </a>
                </p>
            </div>

            <app-address-template *ngIf="organisation.address" [address]="organisation.address"></app-address-template>
        </div>
    `,
    styles: ['.metadata-title { font-size: 95%; }']
})

export class OrganisationTemplateComponent {
    // input parameter
    @Input() organisation: Organization;
}
