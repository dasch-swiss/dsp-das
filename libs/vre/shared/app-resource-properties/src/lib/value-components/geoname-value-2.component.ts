import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GeonameService, SearchPlace } from '@dsp-app/src/app/workspace/resource/services/geoname.service';
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
      data-cy="geoname-autocomplete"
      [matAutocomplete]="auto" />
    <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayPlaceInSearch.bind(this)">
      <mat-option *ngFor="let place of places" [value]="place.id"> {{ place?.displayName }}</mat-option>
    </mat-autocomplete>
  </mat-form-field>`,
})
export class GeonameValue2Component implements OnInit {
  @Input() control: FormControl<string>;
  places: SearchPlace[];

  constructor(private _geonameService: GeonameService) {}

  ngOnInit() {
    if (this.control.value) {
      this._geonameService.resolveGeonameID(this.control.value).subscribe(place => {
        this.places = [
          {
            ...place,
            id: this.control.value,
            locationType: '',
          },
        ];
      });
    }

    this.control.valueChanges
      .pipe(
        filter(searchTerm => searchTerm.length >= 3),
        switchMap((searchTerm: string) => this._geonameService.searchPlace(searchTerm))
      )
      .subscribe(places => {
        this.places = places;
      });
  }

  displayPlaceInSearch(placeId: string) {
    return this.places?.find(place => place.id === placeId).displayName;
  }
}
