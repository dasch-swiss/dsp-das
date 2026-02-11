import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CenteredLayoutComponent } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [MatButtonModule, MatIconModule, CenteredLayoutComponent],
})
export class FooterComponent {
  currentYear = new Date();
}
