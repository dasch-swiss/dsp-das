import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
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
export class NuListComponent implements OnInit {
  @Input() itemTpl!: TemplateRef<any>;
  @Input() formArray!: FormValueArray;
  @Input() cardinality!: Cardinality;
  @Output() addItem = new EventEmitter();

  protected readonly Cardinality = Cardinality;

  ngOnInit() {
    console.log(this);
  }
}
