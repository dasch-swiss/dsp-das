import { AfterViewInit, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { Constants } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { JsLibPotentialError } from './JsLibPotentialError';

@Component({
  selector: 'app-property-value-switcher-2',
  template: `
    <ng-template #textEditorTpl let-item="item">
      <app-common-input [control]="item" style="width: 100%" data-cy="text-input" label="Text value" />
    </ng-template>

    <ng-template #textTpl let-item="item">
      <h2>Working</h2>
    </ng-template>
  `,
})
export class PropertyValueSwitcher2Component implements AfterViewInit {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
  @Output() templateFound = new EventEmitter<TemplateRef<any>>();

  @ViewChild('textEditorTpl') textEditorTpl!: TemplateRef<any>;
  @ViewChild('textTpl') textTpl!: TemplateRef<any>;

  get propertyDefinition() {
    // TODO NEEDED?
    return JsLibPotentialError.setAs(this.myProperty.propDef);
  }

  ngAfterViewInit() {
    this.templateFound.emit(this._getTemplate());
  }

  private _getTemplate(): TemplateRef<any> {
    switch (this.propertyDefinition.objectType) {
      case Constants.TextValue:
        return this.textEditorTpl;
      default: {
        throw Error(`Unrecognized property ${this.propertyDefinition.objectType}`);
      }
    }
  }
}
