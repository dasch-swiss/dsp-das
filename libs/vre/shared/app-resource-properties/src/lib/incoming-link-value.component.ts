import { Component, Input, OnChanges } from '@angular/core';
import {
  IncomingLink,
  PropertiesDisplayIncomingLinkService,
} from '@dsp-app/src/app/workspace/resource/properties/properties-display-incoming-link.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-incoming-link-value',
  template: `
    <div *ngFor="let res of incomingLinks$ | async; let last = last">
      <a style="display: block; margin-bottom: 4px" [routerLink]="res.uri" target="_blank">
        <span>{{ res.project }}</span
        >:
        <strong>{{ res.label }}</strong>
      </a>
    </div>
  `,
})
export class IncomingLinkValueComponent implements OnChanges {
  @Input({ required: true }) resourceId!: string;
  incomingLinks$!: Observable<IncomingLink[]>;

  constructor(private _propertiesDisplayIncomingLink: PropertiesDisplayIncomingLinkService) {}

  ngOnChanges() {
    this.incomingLinks$ = this._propertiesDisplayIncomingLink.getIncomingLinks$(this.resourceId, 0);
  }
}
