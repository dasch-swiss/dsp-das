import { Component } from '@angular/core';
import { AppError } from '@dasch-swiss/vre/core/error-handler';
import { FootnoteService } from './footnote.service';

@Component({
  selector: 'app-footnotes',
  template: `<h5>{{ 'resource.footnotes' | translate }}</h5>
    <div
      *ngFor="let footnote of footnoteService.footnotes; let index = index; trackBy: trackByIndex"
      (click)="goToFootnote(footnote.uuid)"
      class="footnote"
      [attr.data-uuid]="footnote.uuid"
      data-cy="footnote">
      <span style="padding-top: 1em">{{ index + 1 }}.</span> <span [innerHTML]="footnote.content"></span>
    </div>`,
  styles: [
    `
      .footnote {
        display: flex;
        gap: 5px;
      }
    `,
  ],
})
export class FootnotesComponent {
  constructor(public readonly footnoteService: FootnoteService) {}

  goToFootnote(uuid: string) {
    const element = document.getElementById(uuid);
    if (!element) {
      throw new AppError(`Element with uid ${uuid} is not found on page.`);
    }

    element.scrollIntoView();
  }

  trackByIndex(index: number) {
    return index;
  }
}
