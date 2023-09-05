import { Component, Input, OnChanges } from '@angular/core';
import {DspTextFormControlDef} from "../../vre-forms";
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'dsp-app-generic-text-form-component-n',
    templateUrl: './generic-text-form-component-n.component.html',
    styleUrls: ['./generic-text-form-component-n.component.css'],
})
export class GenericTextFormComponentNComponent implements OnChanges {
    @Input() formDef: DspTextFormControlDef;
    @Input() formGroup: FormGroup;

    formControl: FormControl;
    initialValue: string;

    ngOnChanges() {
        if (!this.formGroup || !this.formDef) {return;}
        this.formControl = this.formGroup.get(this.formDef.formControlName) as FormControl;
        this.initialValue = this.formControl.value;
    }

    resetValue() {
        this.formControl.reset(this.initialValue);
    }
}
