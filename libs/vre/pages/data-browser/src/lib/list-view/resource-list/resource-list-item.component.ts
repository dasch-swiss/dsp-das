import { Component, Input } from '@angular/core';
import { Constants, ReadResource } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-resource-list-item',
  template: `
    <div class="link">
      <mat-list-item>
        <div class="res-list-item-container" matListItemTitle>
          <div class="res-list-item-content" data-cy="resource-list-item" (click)="selectResource()">
            <mat-icon matListItemIcon>{{ icon }}</mat-icon>
            <div class="res-list-item-text" matLine>
              <p class="res-class-label shorten-long-text">{{ resource.entityInfo.classes[resource.type].label }}</p>
              <h3 class="res-class-value shorten-multiline-text">{{ resource.label }}</h3>
              <div *ngFor="let prop of resource.properties | keyvalue" matLine>
                <div *ngFor="let val of prop.value" matLine>
                  <span class="res-prop-label shorten-long-text">
                    {{ resource.entityInfo.properties[val.property].label }}
                  </span>
                  <div class="shorten-long-text" [innerHtml]="val.strval | internalLinkReplacer | addTargetBlank"></div>
                </div>
              </div>
            </div>
          </div>
          <mat-checkbox class="res-checkbox" [id]="resource.id" (change)="selectResource()"></mat-checkbox>
        </div>
      </mat-list-item>
    </div>
  `,
})
export class ResourceListItemComponent {
  @Input({ required: true }) resource!: ReadResource;

  get icon() {
    const subclass = this.resource.entityInfo.classes[this.resource.type].subClassOf[0];

    switch (subclass) {
      case Constants.AudioRepresentation:
        return 'audio_file';
      case Constants.ArchiveRepresentation:
        return 'folder_zip';
      case Constants.DocumentRepresentation:
        return 'description';
      case Constants.MovingImageRepresentation:
        return 'video_file';
      case Constants.StillImageRepresentation:
        return 'image';
      case Constants.TextRepresentation:
        return 'text_snippet';
      default: // resource does not have a file representation
        return 'insert_drive_file';
    }
  }

  selectResource() {}
}
