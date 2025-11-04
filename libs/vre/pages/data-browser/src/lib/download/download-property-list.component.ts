import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';

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
      @for (property of properties; track property.property.id) {
        <div
          style="display: flex; align-items: flex-start; padding: 12px 8px; border-bottom: 1px solid #f5f5f5"
          [style.background-color]="property.selected ? '#f0f7ff' : 'transparent'">
          <mat-checkbox [checked]="property.selected" (change)="toggleProperty(property)" style="margin-right: 12px" />
          <div style="flex: 1">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
              <span style="font-weight: 500">{{ property.property.label }}</span>
              @if (true) {
                <span
                  style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500">
                  Required
                </span>
              }
              <span style="color: #666; font-size: 13px">{{ 'TYPE' }}</span>
            </div>
            <p style="margin: 0; color: #666; font-size: 13px">{{ property.property.comment }}</p>
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
export class DownloadPropertyListComponent implements OnInit {
  @Input({ required: true }) propertyDefinitions!: ResourcePropertyDefinition[];
  @Output() propertiesChange = new EventEmitter<string[]>();

  properties!: { selected: boolean; property: ResourcePropertyDefinition }[];
  get selectedCount(): number {
    return this.properties.filter(p => p.selected).length;
  }

  ngOnInit() {
    console.log('aaa', this.propertyDefinitions);
    this.properties = this.propertyDefinitions.map(p => ({
      selected: false,
      property: p,
    }));
  }

  selectAll(): void {
    this.properties.forEach(p => {
      p.selected = true;
    });
    this.propertiesChange.emit(this.properties.map(v => v.property.id));
  }

  selectNone(): void {
    this.properties.forEach(p => {
      p.selected = false;
    });
    this.propertiesChange.emit(this.properties.map(v => v.property.id));
  }

  toggleProperty(property: { selected: boolean; property: ResourcePropertyDefinition }): void {
    property.selected = !property.selected;
    this.propertiesChange.emit(this.properties.map(v => v.property.id));
  }
}
