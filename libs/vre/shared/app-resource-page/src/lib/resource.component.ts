import { Component, Input, OnChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { RegionService, ValueOperationEventService } from '@dasch-swiss/vre/shared/app-representations';
import { CompoundService } from './compound/compound.service';
import { getFileValue } from './get-file-value';
import { ResourcePageService } from './resource-page.service';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  providers: [ValueOperationEventService, ResourcePageService, CompoundService, RegionService],
})
export class ResourceComponent implements OnChanges {
  @Input({ required: true }) resource!: DspResource;

  showRestrictedMessage = true;
  resourceIsObjectWithoutRepresentation!: boolean;

  constructor(
    private _router: Router,
    private _titleService: Title,
    public resourcePageService: ResourcePageService
  ) {
    this._router.events.subscribe(() => {
      this._titleService.setTitle('Resource view');
    });
  }

  ngOnChanges() {
    this.showRestrictedMessage = true;
    this.resourceIsObjectWithoutRepresentation = getFileValue(this.resource) === null;

    this.resourcePageService.onInit(this.resource);
  }
}
