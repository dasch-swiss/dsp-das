import { Component, Input, OnInit } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { distinctUntilChanged } from 'rxjs/operators';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value',
  template: `
    <app-property-value-display [index]="index" *ngIf="displayMode" />
    <app-property-value-update [index]="index" *ngIf="!displayMode" />
  `,
})
export class PropertyValueComponent implements OnInit {
  @Input({ required: true }) index!: number;

  displayMode = false;
  readonly Cardinality = Cardinality;

  constructor(public propertyValueService: PropertyValueService) {}

  ngOnInit() {
    this.propertyValueService.lastOpenedItem$.pipe(distinctUntilChanged()).subscribe(value => {
      this.displayMode = this.index !== value;
    });
  }
}
