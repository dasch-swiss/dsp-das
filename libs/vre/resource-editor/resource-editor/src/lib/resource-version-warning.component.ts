import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AlertInfoComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-resource-version-warning',
  template: `
    <app-alert-info>
      <div style="flex: 1; display: flex; justify-content: space-between; align-items: center">
        {{ 'resourceEditor.versioned' | translate }} {{ resourceVersion }}.
        <button matButton="filled" (click)="navigateToCurrentVersion.emit()">
          {{ 'resourceEditor.seeCurrentVersion' | translate }}
        </button>
      </div>
    </app-alert-info>
  `,
  imports: [MatButtonModule, TranslatePipe, AlertInfoComponent],
})
export class ResourceVersionWarningComponent {
  @Input({ required: true }) resourceVersion!: string;
  @Output() navigateToCurrentVersion = new EventEmitter<void>();
}
