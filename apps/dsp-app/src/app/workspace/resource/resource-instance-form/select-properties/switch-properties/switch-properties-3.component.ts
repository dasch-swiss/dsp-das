import { AfterViewInit, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { Constants, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-switch-properties-3',
  template: `
    <app-nu-list [itemTpl]="itemTpl" [formArray]="formArray"></app-nu-list>

    <ng-template let-item #intTpl>
      <app-int-value-3 [control]="item"></app-int-value-3>
    </ng-template>
  `,
})
export class SwitchProperties3Component implements AfterViewInit {
  @Input() property: ResourcePropertyDefinition;
  @Input() formArray: FormArray;

  @ViewChild('intTpl') intTpl: TemplateRef<any>;

  itemTpl: TemplateRef<any>;

  ngAfterViewInit() {
    this.itemTpl = this.getTemplate();
  }

  private getTemplate() {
    switch (this.property.objectType) {
      case Constants.IntValue:
        return this.intTpl;
    }
  }
}
