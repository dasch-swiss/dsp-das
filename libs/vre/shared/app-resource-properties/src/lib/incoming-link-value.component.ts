import { Component, Input } from '@angular/core';
import { IncomingLink } from '@dsp-app/src/app/workspace/resource/properties/properties-display-incoming-link.service';

@Component({
  selector: 'app-incoming-link-value',
  template: `
    <div *ngFor="let res of incomingLinks; let last = last">
      <a style="display: block; margin-bottom: 4px" [routerLink]="res.uri" target="_blank">
        <span>{{ res.project }}</span
        >:
        <strong>{{ res.label }}</strong>
      </a>
    </div>
  `,
})
export class IncomingLinkValueComponent {
  @Input({ required: true }) incomingLinks!: IncomingLink[];
}
