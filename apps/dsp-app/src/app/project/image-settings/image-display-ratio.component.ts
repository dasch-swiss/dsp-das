import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-image-display-ratio',
  template: ` <div class="frame">
    <div
      [ngStyle]="{
        width: ratio * 200 + 'px',
        height: ratio * 260 + 'px',
        filter: 'blur(' + Math.floor(ratio * 4) + 'px)'
      }"
      class="back-rectangle"></div>
    <div class="helper">Ratio: {{ Math.ceil(ratio * 100) }}%</div>
  </div>`,
  styles: [
    `
      .frame {
        background: gray;
        width: 200px;
        height: 260px;
        position: relative;
      }

      .back-rectangle {
        background: no-repeat center/100% url('../../../assets/images/image-settings.jpg');
        bottom: 0;
        right: 0;
        position: absolute;
      }

      .helper {
        min-width: 100px;
        position: absolute;
        bottom: -30px;
        right: 0;
        text-align: center;
        width: 100%;
        filter: initial;
      }
    `,
  ],
})
export class ImageDisplayRatioComponent {
  @Input() ratio: number;
  protected readonly Math = Math;
}
