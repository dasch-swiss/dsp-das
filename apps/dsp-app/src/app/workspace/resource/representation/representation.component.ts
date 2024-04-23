import { Component, Input } from '@angular/core';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-representation',
  templateUrl: './representation.component.html',
  styleUrls: ['./representation.component.scss'],
})
export class RepresentationComponent {
  @Input() resource: DspResource;

  constructor() {}
}
