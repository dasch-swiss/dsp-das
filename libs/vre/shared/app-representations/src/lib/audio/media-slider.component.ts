import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-media-slider',
  template: ` <mat-toolbar-row style="height: 34px; background-color: black">
    <mat-slider color="accent" style="width: 100%" [max]="max" [min]="0" [step]="1">
      <input matSliderThumb [ngModel]="currentTime" (ngModelChange)="afterNavigation.emit($event)" />
    </mat-slider>
  </mat-toolbar-row>`,
})
export class MediaSliderComponent {
  @Input({ required: true }) max!: number;
  @Input({ required: true }) currentTime!: number;
  @Output() afterNavigation = new EventEmitter<number>();
}
