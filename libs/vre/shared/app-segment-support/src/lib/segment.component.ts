import { Component, Input } from '@angular/core';
import { Segment } from './segment';

@Component({
  selector: 'app-segment',
  template: `
    <div style="height: 40px; background: lightblue; color: white">
      {{ segment.hasTitle?.strval }} : {{ segment.hasSegmentBounds.start }} {{ segment.hasSegmentBounds.end }}
    </div>
  `,
})
export class SegmentComponent {
  @Input({ required: true }) segment!: Segment;
}
