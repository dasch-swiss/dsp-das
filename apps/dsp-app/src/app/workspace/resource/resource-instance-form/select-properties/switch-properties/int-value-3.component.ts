import { Component, Input } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-int-value-3',
  template: ` <div *ngFor="let control of formArray.controls; let index = index" style="display: flex">
      <mat-form-field style="width: 100%">
        <input matInput [formControl]="control" type="number" [step]="step" />
      </mat-form-field>
      <button mat-raised-button (click)="formArray.removeAt(index)">Remove</button>
    </div>
    <button mat-raised-button (click)="add()">Add</button>`,
})
export class IntValue3Component {
  @Input() formArray: FormArray<FormControl<number>>;
  @Input() step?: number;

  add() {
    this.formArray.push(new FormControl<number>(0));
  }
}
