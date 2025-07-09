import { Component } from '@angular/core';
import { PropertiesDisplayService } from './properties-display.service';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value-display-comment',
  template: ` <div class="comment">
    <div
      *ngIf="
        (propertiesDisplayService.showComments$ | async) &&
        propertyValueService.editModeData.values[index].valueHasComment as comment
      "
      data-cy="property-value-comment"
      style=" font-size: small">
      {{ comment }}
    </div>
  </div>`,
  styleUrls: ['./property-value-display-comment.component.scss'],
})
export class PropertyValueDisplayCommentComponent {
  index!: number;

  constructor(
    public propertiesDisplayService: PropertiesDisplayService,
    public propertyValueService: PropertyValueService
  ) {}
}
