import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { FootnoteService } from './footnote.service';
import { PropertiesDisplayService } from './properties-display.service';

@Component({
  selector: 'app-property-row',
  template: ` <div
    class="property-row"
    [class.border-bottom]="borderBottom"
    [ngClass]="{ hidden: (showAllProperties | async) === false && isEmptyRow }">
    <div class="label mat-subtitle-2" [matTooltip]="tooltip ?? ''" matTooltipPosition="above">{{ label }}</div>
    <div style="flex: 1" class="value" [ngClass]="{ 'with-padding': withPadding }">
      <ng-content />
      <app-footnotes *ngIf="footnoteService.footnotes.length > 0" />
    </div>
  </div>`,
  providers: [FootnoteService],
  styleUrls: ['./property-row.component.scss'],
})
export class PropertyRowComponent implements OnChanges {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) borderBottom!: boolean;
  @Input({ required: true }) isEmptyRow!: boolean;
  @Input() tooltip: string | undefined;
  @Input() prop: PropertyInfoValues | undefined;
  @Input() withPadding = true;

  showAllProperties = this._propertiesDisplayService.showAllProperties$;

  constructor(
    public footnoteService: FootnoteService,
    private _propertiesDisplayService: PropertiesDisplayService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['prop']) {
      this.footnoteService.reset();
    }
  }
}
