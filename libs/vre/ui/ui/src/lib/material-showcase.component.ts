import { Component } from '@angular/core';
import { CenteredLayoutComponent } from './centered-layout.component';

interface ColorRole {
  name: string;
  cssVar: string;
  textCssVar: string;
}

interface ColorGroup {
  name: string;
  roles: ColorRole[];
}

@Component({
  selector: 'app-material-showcase',
  templateUrl: './material-showcase.component.html',
  styleUrl: './material-showcase.component.scss',
  imports: [CenteredLayoutComponent],
})
export class MaterialShowcaseComponent {
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

  colorGroups: ColorGroup[] = [
    {
      name: 'Primary',
      roles: [
        { name: 'Primary', cssVar: '--mat-sys-primary', textCssVar: '--mat-sys-on-primary' },
        { name: 'On Primary', cssVar: '--mat-sys-on-primary', textCssVar: '--mat-sys-primary' },
        {
          name: 'Primary Container',
          cssVar: '--mat-sys-primary-container',
          textCssVar: '--mat-sys-on-primary-container',
        },
        {
          name: 'On Primary Container',
          cssVar: '--mat-sys-on-primary-container',
          textCssVar: '--mat-sys-primary-container',
        },
      ],
    },
    {
      name: 'Secondary',
      roles: [
        { name: 'Secondary', cssVar: '--mat-sys-secondary', textCssVar: '--mat-sys-on-secondary' },
        { name: 'On Secondary', cssVar: '--mat-sys-on-secondary', textCssVar: '--mat-sys-secondary' },
        {
          name: 'Secondary Container',
          cssVar: '--mat-sys-secondary-container',
          textCssVar: '--mat-sys-on-secondary-container',
        },
        {
          name: 'On Secondary Container',
          cssVar: '--mat-sys-on-secondary-container',
          textCssVar: '--mat-sys-secondary-container',
        },
      ],
    },
    {
      name: 'Tertiary',
      roles: [
        { name: 'Tertiary', cssVar: '--mat-sys-tertiary', textCssVar: '--mat-sys-on-tertiary' },
        { name: 'On Tertiary', cssVar: '--mat-sys-on-tertiary', textCssVar: '--mat-sys-tertiary' },
        {
          name: 'Tertiary Container',
          cssVar: '--mat-sys-tertiary-container',
          textCssVar: '--mat-sys-on-tertiary-container',
        },
        {
          name: 'On Tertiary Container',
          cssVar: '--mat-sys-on-tertiary-container',
          textCssVar: '--mat-sys-tertiary-container',
        },
      ],
    },
    {
      name: 'Error',
      roles: [
        { name: 'Error', cssVar: '--mat-sys-error', textCssVar: '--mat-sys-on-error' },
        { name: 'On Error', cssVar: '--mat-sys-on-error', textCssVar: '--mat-sys-error' },
        { name: 'Error Container', cssVar: '--mat-sys-error-container', textCssVar: '--mat-sys-on-error-container' },
        { name: 'On Error Container', cssVar: '--mat-sys-on-error-container', textCssVar: '--mat-sys-error-container' },
      ],
    },
    {
      name: 'Surface',
      roles: [
        { name: 'Surface', cssVar: '--mat-sys-surface', textCssVar: '--mat-sys-on-surface' },
        { name: 'On Surface', cssVar: '--mat-sys-on-surface', textCssVar: '--mat-sys-surface' },
        { name: 'Surface Variant', cssVar: '--mat-sys-surface-variant', textCssVar: '--mat-sys-on-surface-variant' },
        { name: 'On Surface Variant', cssVar: '--mat-sys-on-surface-variant', textCssVar: '--mat-sys-surface-variant' },
      ],
    },
    {
      name: 'Surface Containers',
      roles: [
        {
          name: 'Surface Container Lowest',
          cssVar: '--mat-sys-surface-container-lowest',
          textCssVar: '--mat-sys-on-surface',
        },
        {
          name: 'Surface Container Low',
          cssVar: '--mat-sys-surface-container-low',
          textCssVar: '--mat-sys-on-surface',
        },
        { name: 'Surface Container', cssVar: '--mat-sys-surface-container', textCssVar: '--mat-sys-on-surface' },
        {
          name: 'Surface Container High',
          cssVar: '--mat-sys-surface-container-high',
          textCssVar: '--mat-sys-on-surface',
        },
        {
          name: 'Surface Container Highest',
          cssVar: '--mat-sys-surface-container-highest',
          textCssVar: '--mat-sys-on-surface',
        },
      ],
    },
    {
      name: 'Outline',
      roles: [
        { name: 'Outline', cssVar: '--mat-sys-outline', textCssVar: '--mat-sys-surface' },
        { name: 'Outline Variant', cssVar: '--mat-sys-outline-variant', textCssVar: '--mat-sys-on-surface' },
      ],
    },
    {
      name: 'Inverse',
      roles: [
        { name: 'Inverse Surface', cssVar: '--mat-sys-inverse-surface', textCssVar: '--mat-sys-inverse-on-surface' },
        { name: 'Inverse On Surface', cssVar: '--mat-sys-inverse-on-surface', textCssVar: '--mat-sys-inverse-surface' },
        { name: 'Inverse Primary', cssVar: '--mat-sys-inverse-primary', textCssVar: '--mat-sys-on-primary-container' },
      ],
    },
  ];
}
