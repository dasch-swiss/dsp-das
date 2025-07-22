import { Component, Input } from '@angular/core';
import { ReadUriValue } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-uri-viewer',
  template: ` <a [href]="value.uri" target="_blank"
    >{{ value.uri }}
    <mat-icon style="font-size: 18px;vertical-align: middle;line-height: 0.8;width: 18px;height: 18px;"
      >open_in_new
    </mat-icon>
  </a>`,
})
export class UriViewerComponent {
  @Input({ required: true }) value!: ReadUriValue;
}
