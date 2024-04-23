import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DspCompoundPosition } from '@dsp-app/src/app/workspace/resource/dsp-resource';

@Component({
  selector: 'app-still-image-navbar',
  templateUrl: './still-image-navbar.component.html',
  styleUrls: ['./still-image-navbar.component.scss'],
})
export class StillImageNavbarComponent {
  @Input() compoundPosition: DspCompoundPosition;

  @Output() page = new EventEmitter<number>();
}
