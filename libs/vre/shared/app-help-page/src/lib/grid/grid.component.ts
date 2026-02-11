import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

export interface GridItem {
  icon?: string;
  title: string;
  url?: string;
  urlText?: string;
  text: string;
}

@Component({
  selector: 'app-grid',
  template: `
    @for (item of list; track item) {
      <div class="app-grid-item">
        @if (item.icon) {
          <mat-icon class="topic">{{ item.icon }}</mat-icon>
        }
        <h3 class="mat-title-large" style="margin: 16px 0">{{ item.title }}</h3>
        <p style="flex: 1">{{ item.text }}</p>
        @if (item.url) {
          <span>
            @switch (item.url.substring(0, 4)) {
              @case ('http') {
                <a matButton [href]="item.url" target="_blank">
                  {{ item.urlText ? item.urlText : ('shared.grid.readMore' | translate) }}
                  <mat-icon iconPositionEnd style="margin-left: 8px">launch</mat-icon>
                </a>
              }
              @case ('mail') {
                <a matButton [href]="item.url">
                  {{ item.urlText ? item.urlText : ('shared.grid.readMore' | translate) }}
                  <mat-icon iconPositionEnd style="margin-left: 8px">mail</mat-icon>
                </a>
              }
              @default {
                <button matButton [routerLink]="[item.url]">
                  {{ item.urlText ? item.urlText : ('shared.grid.readMore' | translate) }}
                </button>
              }
            }
          </span>
        }
      </div>
    }
  `,
  styleUrls: ['./grid.component.scss'],
  imports: [MatButtonModule, MatIconModule, RouterLink, TranslatePipe],
})
export class GridComponent {
  @Input({ required: true }) list!: GridItem[];
}
