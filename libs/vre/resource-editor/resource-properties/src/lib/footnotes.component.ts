import { Component } from '@angular/core';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { FootnoteService } from './footnote.service';

@Component({
  selector: 'app-footnotes',
  template: `<h5>Footnotes</h5>
    <div
      *ngFor="let footnote of footnoteService.footnotes; let index = index; trackBy: trackByIndex"
      (click)="goToFootnote(footnote.uid)"
      class="footnote"
      data-cy="footnote">
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

  trackByIndex(index: number) {
    return index;
  }
}
