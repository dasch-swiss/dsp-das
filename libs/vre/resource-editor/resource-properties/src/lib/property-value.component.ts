import { Component, Input, OnInit } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { distinctUntilChanged } from 'rxjs/operators';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value',
  template: `
    <app-property-value-display [index]="index" *ngIf="displayMode === true" />
    <app-property-value-update [index]="index" *ngIf="displayMode === false" />

    <!--<app-property-value-comment [displayMode]="true" [control]="group.controls.comment" />-->
  `,
})
export class PropertyValueComponent implements OnInit {
  @Input({ required: true }) index!: number;

  displayMode?: boolean;
  readonly Cardinality = Cardinality;

  constructor(public propertyValueService: PropertyValueService) {}

  ngOnInit() {
    this._setupDisplayMode();
  }

  private _setupDisplayMode() {
    this.propertyValueService.lastOpenedItem$.pipe(distinctUntilChanged()).subscribe(value => {
      this.displayMode = this.index !== value;
    });
  }
}
