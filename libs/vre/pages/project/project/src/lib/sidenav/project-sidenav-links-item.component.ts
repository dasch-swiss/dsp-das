import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatListItemTitle } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects-sidenav-links-item',
  template: `
    <a mat-list-item class="section-title" [routerLink]="link" style="cursor: pointer" [ngClass]="{ active: active }">
      <span matListItemTitle class="section-label">
        <mat-icon class="sidenav-prefix-icon">{{ icon }}</mat-icon>
        <p>{{ label }}</p>
      </span>
    </a>
  `,
  styleUrls: ['./project-sidenav-links-item.component.scss'],
  standalone: true,
  imports: [MatListItem, RouterLink, NgClass, MatListItemTitle, MatIcon],
})
export class ProjectSidenavLinksItemComponent {
  @Input({ required: true }) link!: string[];
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) active!: boolean;
}
