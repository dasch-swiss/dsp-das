import { Component } from '@angular/core';

@Component({
  selector: 'app-image-display-absolute',
  template: ` <div
    style="background: gray; width: 304px; height: 200px; margin-top: 50px; margin-bottom: 50px; position: relative">
    <div
      [ngStyle]="{ width: value }"
      style="background: darkgray; height: 40%;bottom: 0;right: 0;position: absolute;"></div>
    <div class="arrow left-arrow" [ngStyle]="{ width: '50%' }"></div>
    <div class="arrow right-arrow" [ngStyle]="{ width: '50%' }"></div>
    <div style="position: absolute; bottom: -40px; right: 0; text-align: center" [ngStyle]="{ width: '50%' }">
      width
    </div>
  </div>`,
  styles: [
    `
      .arrow {
        position: absolute;
        height: 1px; /* Adjust the height of the stick */
        background-color: red; /* Adjust the color of the stick */
        right: 0;
        bottom: -20px;
      }

      .left-arrow::before,
      .right-arrow::before {
        content: '';
        position: absolute;
        top: -5px;
        width: 0;
        height: 0;
        border-top: 5px solid transparent; /* Adjust the height of the arrow */
        border-bottom: 5px solid transparent; /* Adjust the height of the arrow */
      }

      .left-arrow::before {
        right: 0;
        border-left: 10px solid red; /* Adjust the width and color of the arrow */
      }

      .right-arrow::before {
        left: 0;
        border-right: 10px solid red; /* Adjust the width and color of the arrow */
      }
    `,
  ],
})
export class ImageDisplayAbsoluteComponent {
  value = '50%';
}
