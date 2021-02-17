import { Component, Input } from '@angular/core';
import { Address } from "@dasch-swiss/dsp-js";

@Component({
    selector: 'app-address-template',
    template: `
        <div class="sub-details">
            <h4>Address:</h4>
            <address class="add-margin-left">
                <p>{{ address.streetAddress }}</p>
                <span class="postcode">{{ address.postalCode }}</span>
                <span>{{ address.addressLocality }}</span>
            </address>
        </div>
    `,
    styles: ['.postcode { margin-right: 6px; }']
})
export class AddressTemplateComponent {
    @Input() address: Address;
}
