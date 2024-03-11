import { Component, Input } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-nu-list',
  template: ` <div *ngFor="let control of formArray.controls; let index = index" style="display: flex">
      <ng-container *ngTemplateOutlet="itemTpl; context: { $implicit: control }"></ng-container>
      <button mat-raised-button (click)="formArray.removeAt(index)">Removes</button>
    </div>
    <button mat-raised-button (click)="add()">Add</button>`,
})
export class NuListComponent {
  @Input() itemTpl;
  @Input() formArray: FormArray;

  ngOnChanges() {
    console.log(this.itemTpl, 'changes');
  }

  add() {
    this.formArray.push(new FormControl(0));
  }
}
