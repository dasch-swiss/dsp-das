import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'dasch-swiss-form-actions',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './form-actions.component.html',
    styleUrls: ['./form-actions.component.scss'],
})
export class FormActionsComponent {
    @Input() searchButtonDisabled: boolean | null = true;
}
