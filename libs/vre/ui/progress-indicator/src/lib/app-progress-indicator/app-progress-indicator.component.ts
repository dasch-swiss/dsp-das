import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-progress-indicator',
  imports: [NgIf, MatIconModule],
  templateUrl: './app-progress-indicator.component.html',
  styleUrls: ['./app-progress-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppProgressIndicatorComponent implements OnInit {
  /**
   * @param status number relating to status
   *
   * [status] is a number and can be used when submitting form data:
   *
   * - not ready:    -1
   * - loading:       0
   * - done:          1
   *
   * - error:       400
   */
  @Input() status?: number;

  /**
   * @param color Hex value or predefined color from scss
   *
   * Parameter to customize the appearance of the loader.
   * Hexadecimal color value e.g. #00ff00 or similar color values 'red', 'green' etc.
   *
   * TODO: Default color should come from app settings
   */
  @Input() color = '#5849a7';

  @Input() size: 'xsmall' | 'small' = 'small';

  widthAndHeight!: string;

  ngOnInit() {
    this.widthAndHeight = `${this.getSize()}px`;
  }

  getSize() {
    switch (this.size) {
      case 'xsmall':
        return 24;
      case 'small':
        return 48;
    }
  }
}
