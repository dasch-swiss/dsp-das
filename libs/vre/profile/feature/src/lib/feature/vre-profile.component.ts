import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'dasch-swiss-vre-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vre-profile.component.html',
    styleUrls: ['./vre-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VreProfileComponent {}
