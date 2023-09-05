import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'dsp-app-add-remove-form-component',
    templateUrl: './add-remove-form-component.component.html',
    styleUrls: ['./add-remove-form-component.component.css'],
})
export class AddRemoveFormComponentComponent {
    @Input() hasDuplicates: boolean;
    @Input() isDuplicate: boolean;

    @Output() onDuplicate = new EventEmitter<boolean>;
    @Output() onRemove = new EventEmitter<boolean>;
}
