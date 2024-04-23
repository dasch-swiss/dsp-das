import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DspCompoundPosition } from '@dsp-app/src/app/workspace/resource/dsp-resource';

@Component({
  selector: 'app-compound-navigation',
  templateUrl: './compound-navigation.component.html',
  styleUrls: ['./compound-navigation.component.scss'],
})
export class CompoundNavigationComponent {
  @Input() compoundPosition: DspCompoundPosition;

  @Output() page = new EventEmitter<number>();
}
