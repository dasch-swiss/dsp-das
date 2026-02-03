import { Component } from '@angular/core';
import { CenteredLayoutComponent } from './centered-layout.component';

@Component({
  selector: 'app-typography-showcase',
  templateUrl: './typography-showcase.component.html',
  styleUrl: './typography-showcase.component.scss',
  imports: [CenteredLayoutComponent],
})
export class TypographyShowcaseComponent {
  typographyLevels = {
    display: [
      { level: 'Display Large', class: 'mat-display-large', example: 'Display Large Text' },
      { level: 'Display Medium', class: 'mat-display-medium', example: 'Display Medium Text' },
      { level: 'Display Small', class: 'mat-display-small', example: 'Display Small Text' },
    ],
    headline: [
      { level: 'Headline Large', class: 'mat-headline-large', example: 'Headline Large Text' },
      { level: 'Headline Medium', class: 'mat-headline-medium', example: 'Headline Medium Text' },
      { level: 'Headline Small', class: 'mat-headline-small', example: 'Headline Small Text' },
    ],
    title: [
      { level: 'Title Large', class: 'mat-title-large', example: 'Title Large Text' },
      { level: 'Title Medium', class: 'mat-title-medium', example: 'Title Medium Text' },
      { level: 'Title Small', class: 'mat-title-small', example: 'Title Small Text' },
    ],
    body: [
      { level: 'Body Large', class: 'mat-body-large', example: 'Body Large Text' },
      { level: 'Body Medium', class: 'mat-body-medium', example: 'Body Medium Text' },
      { level: 'Body Small', class: 'mat-body-small', example: 'Body Small Text' },
    ],
    label: [
      { level: 'Label Large', class: 'mat-label-large', example: 'Label Large Text' },
      { level: 'Label Medium', class: 'mat-label-medium', example: 'Label Medium Text' },
      { level: 'Label Small', class: 'mat-label-small', example: 'Label Small Text' },
    ],
  };
}
