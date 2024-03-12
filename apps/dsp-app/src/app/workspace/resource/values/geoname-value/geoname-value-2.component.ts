import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GeonameService, SearchPlace } from '@dsp-app/src/app/workspace/resource/services/geoname.service';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-geoname-value-2',
  template: ` <mat-form-field style="width: 100%">
    <input
      matInput
      [formControl]="control"
      type="text"
      placeholder="Geoname value"
      aria-label="geoname"
      [matAutocomplete]="auto" />
    <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayPlaceInSearch">
      <mat-option *ngFor="let place of places$ | async" [value]="place.id"> {{ place?.displayName }} </mat-option>
    </mat-autocomplete>
  </mat-form-field>`,
})
export class GeonameValue2Component implements OnInit {
  @Input() control: FormControl<string>;
  places$: Observable<SearchPlace[]>;

  constructor(private _geonameService: GeonameService) {}

  ngOnInit() {
    this.places$ = this.control.valueChanges.pipe(
      filter(searchTerm => searchTerm.length >= 3),
      switchMap((searchTerm: string) => this._geonameService.searchPlace(searchTerm))
    );
  }

  displayPlaceInSearch(place: SearchPlace | null) {
    console.log(place);
    if (place !== null) {
      return place.displayName;
    }
  }
}
