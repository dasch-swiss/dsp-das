import { Component, Input } from '@angular/core';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { ResourceHeaderComponent } from '../../header/resource-header.component';
import { ResourceRestrictionComponent } from '../../meta/resource-restriction.component';
import { PropertiesDisplayService } from '../../properties/properties-display/property-value/properties-display.service';
import { ResourceMediaTabsComponent } from '../../properties/resource-media-tabs.component';
import { getFileValue } from '../../representation/get-file-value';
import { isPlaceholderFileValue } from '../../representation/is-placeholder-file-value';
import { RepresentationPlaceholderComponent } from '../../representation/representation-placeholder.component';
import { RepresentationRestrictedComponent } from '../../representation/representation-restricted.component';
import { ResourceLegalComponent } from '../../representation/resource-legal.component';
import { SegmentsService } from '../../representation/segments/segments.service';
import { VideoComponent } from './video.component';

@Component({
  selector: 'app-resource-video',
  template: `
    @if (resource.res.userHasPermission === 'RV') {
      <app-resource-restriction />
    }
    <app-resource-header [resource]="resource" />
    @if (fileValue; as file) {
      <app-resource-legal [fileValue]="file" />
      @if (isPlaceholder) {
        <app-representation-placeholder />
      } @else {
        <app-video [src]="file" [parentResource]="resource.res" />
      }
    } @else {
      <app-representation-restricted />
    }
    <app-resource-media-tabs [resource]="resource" style="display: block; margin-top: 50px" />
  `,
  providers: [SegmentsService, PropertiesDisplayService],
  imports: [
    ResourceRestrictionComponent,
    ResourceHeaderComponent,
    ResourceLegalComponent,
    RepresentationPlaceholderComponent,
    RepresentationRestrictedComponent,
    VideoComponent,
    ResourceMediaTabsComponent,
  ],
})
export class ResourceVideoComponent {
  @Input({ required: true }) resource!: DspResource;

  get fileValue() {
    return getFileValue(this.resource.res);
  }

  get isPlaceholder() {
    return isPlaceholderFileValue(this.fileValue);
  }
}
