import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CenteredMessageComponent } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-no-results-found',
  template: `
    <app-centered-message
      [icon]="'search_off'"
      [title]="'pages.search.noResultsFound' | translate"
      [message]="message" />
  `,
  standalone: true,
  imports: [TranslateModule, CenteredMessageComponent],
})
export class NoResultsFoundComponent {
  @Input({ required: true }) message!: string;
}
