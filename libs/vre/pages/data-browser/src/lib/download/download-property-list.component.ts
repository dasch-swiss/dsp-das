import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface DownloadProperty {
  name: string;
  label: string;
  description: string;
  type: string;
  required: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-download-property-list',
  template: `
    <div style="margin-bottom: 16px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
        <span style="font-weight: 500">Properties</span>
        <div style="display: flex; gap: 8px">
          <button mat-button color="primary" (click)="selectAll()">Select All</button>
          <button mat-button color="primary" (click)="selectNone()">Select None</button>
        </div>
      </div>
    </div>

    <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; padding: 8px">
      @for (property of properties; track property.name) {
        <div
          style="display: flex; align-items: flex-start; padding: 12px 8px; border-bottom: 1px solid #f5f5f5"
          [style.background-color]="property.selected ? '#f0f7ff' : 'transparent'">
          <mat-checkbox [checked]="property.selected" (change)="toggleProperty(property)" style="margin-right: 12px" />
          <div style="flex: 1">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <span style="font-weight: 500">{{ property.label }}</span>
              @if (property.required) {
                <span
                  style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500">
                  Required
                </span>
              }
              <span style="color: #666; font-size: 13px">{{ property.type }}</span>
            </div>
            <p style="margin: 0; color: #666; font-size: 13px">{{ property.description }}</p>
          </div>
        </div>
      }
    </div>

    <div style="margin-top: 8px; color: #666; font-size: 13px">
      {{ selectedCount }} of {{ properties.length }} properties selected
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DownloadPropertyListComponent {
  @Input({ required: true }) properties: DownloadProperty[] = [];
  @Output() propertiesChange = new EventEmitter<DownloadProperty[]>();

  get selectedCount(): number {
    return this.properties.filter(p => p.selected).length;
  }

  selectAll(): void {
    this.properties.forEach(p => {
      p.selected = true;
    });
    this.propertiesChange.emit(this.properties);
  }

  selectNone(): void {
    this.properties.forEach(p => {
      p.selected = false;
    });
    this.propertiesChange.emit(this.properties);
  }

  toggleProperty(property: DownloadProperty): void {
    property.selected = !property.selected;
    this.propertiesChange.emit(this.properties);
  }
}
