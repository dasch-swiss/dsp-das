import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { FormValueArray } from './form-value-array.type';

@Component({
  selector: 'app-nu-list',
  template: ` <div *ngFor="let group of formArray.controls; let index = index" style="display: flex">
      <div>
        <ng-container *ngTemplateOutlet="itemTpl; context: { $implicit: group.controls.item }"></ng-container>
        <mat-form-field style="flex: 1" subscriptSizing="dynamic" class="formfield">
          <textarea matInput rows="9" [placeholder]="'Comment'" [formControl]="group.controls.comment"></textarea>
        </mat-form-field>
      </div>

      <button (click)="updatedIndex.emit(index)" mat-icon-button *ngIf="canUpdateForm">
        <mat-icon>edit</mat-icon>
      </button>
      <button
        (click)="formArray.removeAt(index)"
        mat-icon-button
        *ngIf="index > 0 || [Cardinality._0_1, Cardinality._0_n].includes(cardinality)">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
    <button
      mat-raised-button
      (click)="addItem.emit()"
      *ngIf="formArray.controls.length === 0 || [Cardinality._0_n, Cardinality._1_n].includes(cardinality)">
      Add
    </button>`,
})
export class NuListComponent {
  @Input() itemTpl!: TemplateRef<any>;
  @Input() formArray!: FormValueArray;
  @Input() cardinality!: Cardinality;
  @Input() canUpdateForm!: boolean;
  @Output() updatedIndex = new EventEmitter<number>();
  @Output() addItem = new EventEmitter();

  protected readonly Cardinality = Cardinality;
}
