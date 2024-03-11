import { Component, Input, TemplateRef } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-nu-list',
  template: ` <div *ngFor="let control of formArray.controls; let index = index" style="display: flex">
      <ng-container *ngTemplateOutlet="itemTpl; context: { $implicit: control }"></ng-container>
      <button
        (click)="formArray.removeAt(index)"
        mat-icon-button
        *ngIf="index > 0 || [Cardinality._0_1, Cardinality._0_n].includes(cardinality)">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
    <button
      mat-raised-button
      (click)="add()"
      *ngIf="formArray.controls.length === 0 || [Cardinality._0_n, Cardinality._1_n].includes(cardinality)">
      Add
    </button>`,
})
export class NuListComponent {
  @Input() itemTpl: TemplateRef<any>;
  @Input() formArray: FormArray;
  @Input() newValue: any;
  @Input() cardinality: Cardinality;

  add() {
    this.formArray.push(new FormControl(this.newValue));
  }

  protected readonly Cardinality = Cardinality;
}
