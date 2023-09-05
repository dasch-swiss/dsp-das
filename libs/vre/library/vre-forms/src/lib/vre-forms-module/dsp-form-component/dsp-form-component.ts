import {
    Component, EventEmitter,
    Input, OnInit, Output
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {DspBoolFormControlDef, DspFormGroupHandler, DspTextFormControlDef} from "../vre-forms";

@Component({
    selector: 'app-dsp-form-component',
    templateUrl: './dsp-form-component.html',
    styleUrls: ['./dsp-form-component.scss']
})
export class DspFormComponent implements OnInit {

    @Input() formControlDefinitions: (DspTextFormControlDef | DspBoolFormControlDef)[] = [];

    @Input() hideEmpty = false;

    @Output() cancel = new EventEmitter<void>();

    @Output() submit = new EventEmitter<FormGroup>();

    fgHandler: DspFormGroupHandler;

    ngOnInit() {
        if (!this.formControlDefinitions) {
            return;
        }
        this.fgHandler = new DspFormGroupHandler(this.formControlDefinitions);
    }

    onCancel() {
        this.cancel.emit();
    }

    onSubmit() {
        this.submit.emit(this.fgHandler.formGroup)
    }

    resetAll() {
        this.fgHandler = new DspFormGroupHandler(this.formControlDefinitions);
    }

    formGroupUnChanged() {
        return this.fgHandler.formDefs.length === this.formControlDefinitions.length;
    }
}
