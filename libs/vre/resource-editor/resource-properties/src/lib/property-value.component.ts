import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value',
  template: `
    <app-property-value-display [index]="index" [itemTpl]="itemTpl" *ngIf="displayMode" />
    <app-property-value-edit [index]="index" [itemTpl]="itemTpl" *ngIf="!displayMode" />
  `,
})
export class PropertyValueComponent implements OnInit {
  @Input({ required: true }) itemTpl!: TemplateRef<any>;
  @Input({ required: true }) index!: number;

  get initialFormValue(): { item: any; comment: string | null } {
    return this.group.getRawValue();
  }

  displayMode = true;
  loading = false;
  subscription!: Subscription;
  protected readonly Cardinality = Cardinality;

  get group() {
    return this.propertyValueService.formArray.at(this.index);
  }

  constructor(public propertyValueService: PropertyValueService) {}

  ngOnInit() {
    this._setupDisplayMode();
  }

  private _setupDisplayMode() {
    if (this.propertyValueService.keepEditMode) {
      this.displayMode = false;
      return;
    }
    this.propertyValueService.lastOpenedItem$.pipe(distinctUntilChanged()).subscribe(value => {
      if (this.propertyValueService.currentlyAdding && !this.displayMode) {
        this.propertyValueService.formArray.removeAt(this.propertyValueService.formArray.length - 1);
        this.propertyValueService.currentlyAdding = false;
        return;
      }

      if (value === null && this.propertyValueService.formArray.length > 0) {
        this.propertyValueService.formArray.at(this.index).patchValue(this.initialFormValue);
      }

      this.displayMode = this.index !== value;
    });
  }
}
