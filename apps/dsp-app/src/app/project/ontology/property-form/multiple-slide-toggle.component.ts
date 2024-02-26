import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-multiple-slide-toggle',
  template: ` <mat-slide-toggle
    [formControl]="control"
    [matTooltip]="'The property in this class can have multiple values'"
    matTooltipPosition="above"
    [checked]="[Cardinality._0_n, Cardinality._1_n].includes(control.value)"
    (change)="toggle()">
    {{ label }}
  </mat-slide-toggle>`,
})
export class MultipleSlideToggleComponent {
  @Input() control: FormControl<Cardinality>;
  @Input() label?: string;
  protected readonly Cardinality = Cardinality;

  toggle() {
    const multipleToggle = new Map<Cardinality, Cardinality>([
      [Cardinality._1, Cardinality._1_n],
      [Cardinality._0_1, Cardinality._0_n],
      [Cardinality._0_n, Cardinality._0_1],
      [Cardinality._1_n, Cardinality._1],
    ]);
    this.control.patchValue(multipleToggle.get(this.control.value));
  }
}
