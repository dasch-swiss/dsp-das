import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ResourceClassDefinition } from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-select-resource-class',
    templateUrl: './select-resource-class.component.html',
    styleUrls: ['./select-resource-class.component.scss']
})
export class SelectResourceClassComponent implements OnInit, OnDestroy {

    @Input() formGroup: FormGroup;

    @Input() resourceClassDefinitions: ResourceClassDefinition[];

    @Output() resourceClassSelected = new EventEmitter<string>();

    form: FormGroup;

    resourceChangesSubscription: Subscription;

    constructor(@Inject(FormBuilder) private _fb: FormBuilder) { }

    ngOnInit(): void {

        // build a form for the named graph selection
        this.form = this._fb.group({
            resources: ['null, Validators.required']
        });

        // emit Iri of the project when selected
        this.resourceChangesSubscription = this.form.valueChanges.subscribe((data) => {
            this.resourceClassSelected.emit(data.resources);
        });

        // add form to the parent form group
        this.formGroup.addControl('resources', this.form);
    }

    ngOnDestroy() {
        if (this.resourceChangesSubscription !== undefined) {
            this.resourceChangesSubscription.unsubscribe();
        }
    }

}
