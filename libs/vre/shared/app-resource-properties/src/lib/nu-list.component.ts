import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { FormValueArray } from './form-value-array.type';
import { NuListService } from './nu-list.service';

@Component({
  selector: 'app-nu-list',
  template: ` <div *ngFor="let group of formArray.controls; let index = index" style="display: flex">
      <app-nu-list-child
        style="width: 100%"
        [itemTpl]="itemTpl"
        [index]="index"
        [formArray]="formArray"
        [canUpdateForm]="canUpdateForm"
        [cardinality]="cardinality"></app-nu-list-child>
    </div>
    <button
      mat-raised-button
      (click)="addItem.emit()"
      *ngIf="
        !nuListService.currentlyAdding &&
        (formArray.controls.length === 0 || [Cardinality._0_n, Cardinality._1_n].includes(cardinality))
      ">
      Add
    </button>`,
})
export class NuListComponent implements OnInit, AfterViewInit {
  @Input() itemTpl!: TemplateRef<any>;
  @Input() formArray!: FormValueArray;
  @Input() cardinality!: Cardinality;
  @Input() canUpdateForm!: boolean;
  @Output() addItem = new EventEmitter();

  initialFormValue: any;
  protected readonly Cardinality = Cardinality;

  displayMode = true;

  constructor(public nuListService: NuListService) {}
  ngOnInit() {}

  ngAfterViewInit() {
    console.log(this, 'afterview');
  }
}
