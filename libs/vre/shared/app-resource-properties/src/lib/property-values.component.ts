import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { NuListService } from './nu-list.service';

@Component({
  selector: 'app-property-values',
  template: ` <div *ngFor="let group of nuListService.formArray.controls; let index = index" style="display: flex">
      <app-nu-list-child style="width: 100%" [itemTpl]="itemTpl" [index]="index"></app-nu-list-child>
    </div>
    <button
      mat-icon-button
      (click)="addItem()"
      *ngIf="
        (!nuListService.currentlyAdding || nuListService.keepEditMode) &&
        (nuListService.formArray.controls.length === 0 ||
          [Cardinality._0_n, Cardinality._1_n].includes(nuListService.cardinality))
      ">
      <mat-icon>add_box</mat-icon>
    </button>`,
})
export class PropertyValuesComponent implements OnInit {
  @Input() itemTpl!: TemplateRef<any>;

  protected readonly Cardinality = Cardinality;

  constructor(
    public nuListService: NuListService,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    if (!this.nuListService.formArray || this.nuListService.formArray.length === 0) {
      throw new Error('The form array should not be empty.');
    }
  }

  addItem() {
    this.nuListService.formArray.push(
      this._fb.group({
        item: propertiesTypeMapping.get(this.nuListService.propertyDefinition.objectType).control() as AbstractControl,
        comment: this._fb.control(''),
      })
    );
    this.nuListService.toggleOpenedValue(this.nuListService.formArray.length - 1);
    this.nuListService.currentlyAdding = true;
  }
}
