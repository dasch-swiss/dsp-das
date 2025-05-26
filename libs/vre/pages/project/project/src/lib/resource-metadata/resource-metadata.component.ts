import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dasch-swiss-resource-metadata',
  templateUrl: './resource-metadata.component.html',
  styleUrl: './resource-metadata.component.scss',
})
export class ResourceMetadataComponent {
  constructor(private _ts: TranslateService) {}
}
