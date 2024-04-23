import { Component } from '@angular/core';

@Component({
  selector: 'app-osd-zoom-panel',
  template: `
    <span>
      <button mat-icon-button id="DSP_OSD_ZOOM_OUT" matTooltip="Zoom out">
        <mat-icon>remove_circle_outline</mat-icon>
      </button>
      <button mat-icon-button id="DSP_OSD_HOME" matTooltip="Reset zoom">
        <mat-icon>adjust</mat-icon>
      </button>
      <button mat-icon-button id="DSP_OSD_ZOOM_IN" matTooltip="Zoom in">
        <mat-icon>add_circle_outline</mat-icon>
      </button>
    </span>
  `,
})
export class OsdZoomPanelComponent {}
