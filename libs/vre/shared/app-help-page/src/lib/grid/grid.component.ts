import { Component, Input } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLinkActive, RouterLink } from '@angular/router';

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
  imports: [MatIcon, MatAnchor, MatButton, RouterLinkActive, RouterLink],
})
export class GridComponent {
  @Input() list: GridItem[];
}
