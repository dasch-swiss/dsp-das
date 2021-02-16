import { Component, Input, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IHasProperty, PropertyDefinition, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { Category, DefaultProperties, PropertyType } from '../default-data/default-properties';
import { Property, ResourceClassFormService } from '../resource-class-form/resource-class-form.service';

@Component({
    selector: 'app-property-info',
    templateUrl: './property-info.component.html',
    styleUrls: ['./property-info.component.scss']
})
export class PropertyInfoComponent implements OnInit {

    @Input() propDef: ResourcePropertyDefinition;

    @Input() propCard: IHasProperty;

    propInfo: Property = new Property();

    propType: PropertyType;

    // list of default property types
    propertyTypes: Category[] = DefaultProperties.data;

    constructor(
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry
    ) {

        // special icons for property type
        this._matIconRegistry.addSvgIcon(
            'integer_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/integer-icon.svg')
        );
        this._matIconRegistry.addSvgIcon(
            'decimal_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/decimal-icon.svg')
        );
    }

    ngOnInit(): void {
        // console.log(this.propDef);
        // console.log(this.propCard);

        // convert cardinality from js-lib convention to app convention
        switch (this.propCard.cardinality) {
            case 0:
                this.propInfo.multiple = false;
                this.propInfo.required = true;
                break;
            case 1:
                this.propInfo.multiple = false;
                this.propInfo.required = false;
                break;
            case 2:
                this.propInfo.multiple = true;
                this.propInfo.required = false;
                break;
            case 3:
                this.propInfo.multiple = true;
                this.propInfo.required = true;
                break;
        }

        // let obj: PropertyType;
            // find gui ele from list of default property-types to set type value
            for (let group of this.propertyTypes) {
                this.propType = group.elements.find(i => i.gui_ele === this.propDef.guiElement && (i.objectType === this.propDef.objectType || i.subPropOf === this.propDef.subPropertyOf[0]));

                if (this.propType) {
                    // console.log(obj)
                    // this.propertyForm.controls['type'].setValue(obj);
                    break;
                }
            }

    }

}
