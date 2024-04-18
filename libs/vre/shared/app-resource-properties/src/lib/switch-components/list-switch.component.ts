import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraApiConnection, ListNodeV2, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-list-switch',
  template: `
    <ng-container *ngIf="displayMode; else editMode">
      {{ label$ | async }}
    </ng-container>
    <ng-template #editMode>
      <app-list-value [control]="control" [propertyDef]="propertyDef"></app-list-value>
    </ng-template>
  `,
})
export class ListSwitchComponent implements IsSwitchComponent, OnInit {
  @Input() control!: FormControl<string>;
  @Input() displayMode = true;
  @Input() propertyDef!: ResourcePropertyDefinition;

  label$!: Observable<string>;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  ngOnInit() {
    this.label$ = (this._dspApiConnection.v2.list.getNode(this.control.value) as Observable<ListNodeV2>).pipe(
      map(v => v.label)
    );
  }
}
