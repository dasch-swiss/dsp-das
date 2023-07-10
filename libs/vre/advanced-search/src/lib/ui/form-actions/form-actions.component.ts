import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'dasch-swiss-form-actions',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './form-actions.component.html',
    styleUrls: ['./form-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormActionsComponent {
    @Input() searchButtonDisabled: boolean | null = true;

    @Output() emitAddPropertyForm = new EventEmitter<void>();
    @Output() emitSearchButtonClicked = new EventEmitter<void>();

    onAddPropertyFormClicked(): void {
        this.emitAddPropertyForm.emit();
    }

    onSearchButtonClicked(): void {
        this.emitSearchButtonClicked.emit();
    }

}
