import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface GridItem {
  icon?: string;
  title: string;
  url?: string;
  urlText?: string;
  text: string;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  standalone: true,
  imports: [MatButton, MatIcon, RouterLink, RouterLinkActive, TranslateModule],
})
export class GridComponent {
  @Input() list: GridItem[];
}
