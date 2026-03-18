import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styles: `
    footer {
      padding: 32px 0 0;
      background: var(--mat-sys-on-primary-container);
      color: var(--mat-sys-surface);
    }

    a {
      color: var(--mat-sys-surface) !important;
      font-weight: bold;
    }
  `,
  imports: [MatButtonModule, MatIconModule, CenteredLayoutComponent],
})
export class FooterComponent {
  currentYear = new Date();
}
