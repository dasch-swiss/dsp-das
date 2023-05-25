import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'dsp-vre-shared-ui',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './vre-shared-ui.component.html',
    styleUrls: ['./vre-shared-ui.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VreSharedUiComponent {}
