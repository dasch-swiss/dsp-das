import { Component, Input } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-footnote-tooltip',
  template: ` <div [class]="tooltipClass">
    <h3>References</h3>
    <div [innerHTML]="content"></div>
  </div>`,
  styles: [
    `
      :host {
        position: absolute;
        z-index: 1000;
      }

      .default-tooltip {
        background: white;
        color: black;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
    `,
  ],
})
export class FootnoteTooltipComponent {
  @Input() content!: SafeHtml;
  @Input() tooltipClass: string = 'default-tooltip';

  ngOnInit() {
    console.log('julien', this.content);
  }
}
