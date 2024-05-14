import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Constants, ReadLinkValue, ReadValue } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues, ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-rich-text-switch',
  template: ` <div
      *ngIf="displayMode; else editMode"
      [innerHTML]="control.value"
      appHtmlLink
      (internalLinkClicked)="_openResource($event)"></div>
    <ng-template #editMode>
      <app-rich-text-value [control]="myControl"></app-rich-text-value>
    </ng-template>`,
})
export class RichTextSwitchComponent implements IsSwitchComponent {
  @Input() control!: FormControl<string | null>;
  @Input() displayMode = true;

  propArray: PropertyInfoValues[] = [];

  get myControl() {
    return this.control as FormControl<string>;
  }

  constructor(private _resourceService: ResourceService) {}

  standoffLinkClicked(resIri: string): void {
    // find the corresponding standoff link value
    const referredResStandoffLinkVal: ReadLinkValue[] = this._getStandoffLinkValueForResource(resIri);

    // only emit an event if the corresponding standoff link value could be found
    if (referredResStandoffLinkVal.length === 1) {
      this._openResource(referredResStandoffLinkVal[0]);
    }
  }

  _openResource(linkValue: ReadLinkValue | string) {
    const iri = typeof linkValue == 'string' ? linkValue : linkValue.linkedResourceIri;
    const path = this._resourceService.getResourcePath(iri);
    window.open(`/resource${path}`, '_blank');
  }

  private _getStandoffLinkValueForResource(resIri: string): ReadLinkValue[] {
    // find the PropertyInfoValues for the standoff link value
    const standoffLinkPropInfoVals: PropertyInfoValues[] = this.propArray.filter(
      resPropInfoVal => resPropInfoVal.propDef.id === Constants.HasStandoffLinkToValue
    );

    if (standoffLinkPropInfoVals.length === 1) {
      // find the corresponding standoff link value
      const referredResStandoffLinkVal: ReadValue[] = standoffLinkPropInfoVals[0].values.filter(
        (standoffLinkVal: ReadValue) =>
          standoffLinkVal instanceof ReadLinkValue && (standoffLinkVal as ReadLinkValue).linkedResourceIri === resIri
      );

      // if no corresponding standoff link value was found,
      // this array is empty
      return referredResStandoffLinkVal as ReadLinkValue[];
    } else {
      // this should actually never happen
      // because all resource types have a cardinality for a standoff link value
      return [];
    }
  }
}
