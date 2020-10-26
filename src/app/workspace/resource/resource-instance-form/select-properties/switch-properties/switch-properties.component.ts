import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Constants, ReadResource, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { BaseValueComponent } from 'src/app/base-value.component';

@Component({
  selector: 'app-switch-properties',
  templateUrl: './switch-properties.component.html',
  styleUrls: ['./switch-properties.component.scss']
})
export class SwitchPropertiesComponent implements OnInit, AfterViewInit {

    @ViewChild('createVal') createValueComponent: BaseValueComponent;

    @Input() property: ResourcePropertyDefinition;

    @Input() parentResource: ReadResource;

    mode = 'create';
    constants = Constants;

    constructor() { }

    ngOnInit(): void {
        console.log('prop', this.property);
    }

    ngAfterViewInit() {
        console.log('createValueComponent', this.createValueComponent);
        this.saveNewValue();
    }

    saveNewValue() {
        const createVal = this.createValueComponent.getNewValue();
        console.log('createVal', createVal);
    }

}
