import { Component, Input, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { NuListService } from './nu-list.service';

@Component({
  selector: 'app-nu-list',
  template: ` <div *ngFor="let group of nuListService.formArray.controls; let index = index" style="display: flex">
      <app-nu-list-child style="width: 100%" [itemTpl]="itemTpl" [index]="index"></app-nu-list-child>
    </div>
    <button
      mat-raised-button
      (click)="addItem()"
      *ngIf="
        !nuListService.currentlyAdding &&
        (nuListService.formArray.controls.length === 0 ||
          [Cardinality._0_n, Cardinality._1_n].includes(nuListService.cardinality))
      ">
      Add
    </button>`,
})
export class NuListComponent {
  @Input() itemTpl!: TemplateRef<any>;

  protected readonly Cardinality = Cardinality;

  constructor(
    public nuListService: NuListService,
    private _fb: FormBuilder
  ) {}

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
