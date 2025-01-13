import { Component } from '@angular/core';
import { FootnoteService } from './footnote.service';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';

@Component({
  selector: 'app-footnotes',
  template: `<h5>References</h5>
    <div
      *ngFor="let footnote of footnoteService.footnotes; let index = index"
      (click)="goToFootnote(footnote.uid)"
      class="footnote">
      {{ index + 1 }}. <span [innerHTML]="footnote.content"></span>
    </div>`,
  styles: [
    `
      .footnote {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    `,
  ],
})
export class FootnotesComponent {
  constructor(public readonly footnoteService: FootnoteService) {}

  goToFootnote(uid: string) {
    const element = document.getElementById(uid);
    if (!element) {
      throw new AppError(`Element with uid ${uid} is not found on page.`);
    }

    element.scrollIntoView();
  }
}
