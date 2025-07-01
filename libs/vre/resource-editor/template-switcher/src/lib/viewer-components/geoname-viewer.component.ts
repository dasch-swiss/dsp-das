import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { DisplayPlace, GeonameService } from '../../../../resource-properties/src/lib/geoname.service';

@Component({
  selector: 'app-geoname-viewer',
  template: `
    <a
      class="link"
      target="_blank"
      rel="noopener"
      data-cy="geoname-switch-link"
      [href]="'https://www.geonames.org/' + control.value"
      >{{ (geonameLabel$ | async)?.displayName }}</a
    >
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeonameViewerComponent implements OnChanges {
  @Input() control!: FormControl<string>;

  geonameLabel$!: Observable<DisplayPlace>;

  constructor(private _geonameService: GeonameService) {}

  ngOnChanges() {
    this.geonameLabel$ = this._geonameService.resolveGeonameID(this.control.value);
  }
}
