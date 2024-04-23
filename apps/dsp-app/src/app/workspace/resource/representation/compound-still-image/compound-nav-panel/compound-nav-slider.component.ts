import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-compound-nav-slider',
  templateUrl: './compound-nav-slider.component.html',
  styleUrls: ['./compound-nav-slider.component.scss'],
})
export class CompoundNavSliderComponent {
  @Input() totalPages: number;

  @Output() pageChange = new EventEmitter<number>();
}
