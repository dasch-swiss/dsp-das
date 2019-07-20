import { FormControl, FormArray, Validators } from '@angular/forms';
import { SourceType } from './source-type.model';

export class SourceTypeForm {
    label = new FormControl();
    permission = new FormControl();
    properties = new FormArray([]);

    constructor (sourceType: SourceType) {

        this.label.setValue(sourceType.label);
        this.label.setValidators([Validators.required]);
        /*
                this.label.setValue(sourceType.label);
                this.label.setValidators([Validators.required]); */


        if (sourceType.properties) {
            this.properties.setValue([sourceType.properties]);
        }
    }
}
