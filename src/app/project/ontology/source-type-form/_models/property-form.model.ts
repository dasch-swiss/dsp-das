import { FormControl, Validators } from '@angular/forms';
import { Property } from './property.model';


export class PropertyForm {
    label = new FormControl();
    type = new FormControl();
    multiple = new FormControl();
    required = new FormControl();
    permission = new FormControl();

    constructor (
        property: Property
    ) {
        this.label.setValue(property.label);
        this.label.setValidators([Validators.required]);

        this.type.setValue(property.type);
        this.type.setValidators([Validators.required]);

        this.multiple.setValue(property.multiple);

        this.required.setValue(property.required);

        this.permission.setValue(property.permission);
        this.permission.setValidators([Validators.required]);
    }
}
