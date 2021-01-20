import { Component, Input } from '@angular/core';
import { IAttribution } from '../dataset-metadata';

@Component({
    selector: 'app-attribution-tab-view',
    templateUrl: './attribution-tab-view.component.html',
    styleUrls: ['./attribution-tab-view.component.scss']
})
export class AttributionTabViewComponent {
    // attribution input
    @Input() attributions: IAttribution[];
}
