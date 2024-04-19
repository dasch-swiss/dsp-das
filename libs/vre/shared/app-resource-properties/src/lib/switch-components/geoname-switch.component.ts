import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DisplayPlace, GeonameService } from '../geoname.service';
import { Observable } from 'rxjs';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-geoname-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode">
      <a class="link" target="_blank" rel="noopener" [href]="'https://www.geonames.org/' + control.value">{{
        (geonameLabel$ | async)?.displayName
      }}</a></ng-container
    >
    <ng-template #editMode>
      <app-geoname-value [control]="control"></app-geoname-value>
    </ng-template>`,
})
export class GeonameSwitchComponent implements IsSwitchComponent, OnInit {
  @Input() control!: FormControl<string>;
  @Input() displayMode = true;

  geonameLabel$!: Observable<DisplayPlace>;

  constructor(private _geonameService: GeonameService) {}

  ngOnInit() {
    if (this.displayMode) {
      this.geonameLabel$ = this._geonameService.resolveGeonameID(this.control.value);
    }
  }
}
