import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hint',
  template: `
    <div class="hint">
      <p>{{ 'ui.hint.useSpecialSyntax' | translate }}</p>
      <ul>
        <li [innerHTML]="'ui.hint.questionMark' | translate"></li>
        <br />
        <li [innerHTML]="'ui.hint.asterisk' | translate"></li>
        <br />
        <li [innerHTML]="'ui.hint.quotationMarks' | translate"></li>
      </ul>
    </div>

    <a mat-button href="https://docs.dasch.swiss/latest/DSP-APP/user-guide/data/search" target="_blank" color="primary">
      {{ 'ui.hint.readMore' | translate }}
      <mat-icon class="suffix">launch</mat-icon>
    </a>
  `,
  styleUrls: ['./hint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, TranslateModule],
  standalone: true,
})
export class HintComponent {}
