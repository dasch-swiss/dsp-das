import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'dsp-vre-shared-progress-indicator',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './progress-indicator.component.html',
    styleUrls: ['./progress-indicator.component.scss'],
})
export class ProgressIndicatorComponent {
    /**
     * @param status number relating to status
     *
     * [status] is a number and can be used when submitting form data:
     *
     * - not ready:    -1
     * - loading:       0
     * - done:          1
     *
     * - error:       400
     */
    @Input() status?: number;

    /**
     * @param color Hex value or predefined color from scss
     *
     * Parameter to customize the appearance of the loader.
     * Hexadecimal color value e.g. #00ff00 or similar color values 'red', 'green' etc.
     *
     * TODO: Default color should come from app settings
     */
    @Input() color = '#5849a7';

    @Input() size: 'small' | 'large' = 'small';

    widthAndHeight: string | null;

    constructor() {
        this.widthAndHeight = this.size === 'small' ? '48px' : '128px';
    }

}
