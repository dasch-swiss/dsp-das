import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadResource } from '@dasch-swiss/dsp-js';
import {
  CreateSegmentDialogComponent,
  CreateSegmentDialogProps,
  SegmentsService,
} from '@dasch-swiss/vre/shared/app-segment-support';

@Component({
  selector: 'app-segment-tab',
  template: ` <button mat-raised-button (click)="add()">Create a segment</button>
    <app-properties-display
      *ngFor="let resource of segmentsService.resources"
      [resource]="resource"
      [properties]="resource.resProps"
      [displayLabel]="true" />`,
})
export class SegmentTabComponent {
  @Input({ required: true }) resource!: ReadResource;

  constructor(
    public segmentsService: SegmentsService,
    private _dialog: MatDialog
  ) {}

  add() {
    this._dialog
      .open<CreateSegmentDialogComponent, CreateSegmentDialogProps>(CreateSegmentDialogComponent, {
        data: { resource: this.resource },
      })
      .afterClosed()
      .subscribe(() => {
        this.segmentsService.getVideoSegment(this.resource.id);
      });
  }
}
