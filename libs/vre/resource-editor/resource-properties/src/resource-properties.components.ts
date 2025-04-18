import { CreateResourceDialogComponent } from './lib/create-resource-dialog.component';
import { CreateResourceFormComponent } from './lib/create-resource-form.component';
import { CreateResourcePageComponent } from './lib/create-resource-page.component';
import { DeleteValueDialogComponent } from './lib/delete-value-dialog.component';
import { EditResourceLabelDialogComponent } from './lib/edit-resource-label-dialog.component';
import { EraseResourceDialogComponent } from './lib/erase-resource-dialog.component';
import { ExistingPropertyValueComponent } from './lib/existing-property-value.component';
import { FootnoteParserPipe } from './lib/footnote-parser.pipe';
import { FootnoteTooltipComponent } from './lib/footnote-tooltip.component';
import { FootnoteDirective } from './lib/footnote.directive';
import { FootnotesComponent } from './lib/footnotes.component';
import { MathJaxDirective } from './lib/mathjax/math-jax.directive';
import { PropertyRowComponent } from './lib/property-row.component';
import { PropertyValueActionBubbleComponent } from './lib/property-value-action-bubble.component';
import { PropertyValueCommentComponent } from './lib/property-value-comment.component';
import { PropertyValueSwitcherComponent } from './lib/property-value-switcher.component';
import { PropertyValueComponent } from './lib/property-value.component';
import { PropertyValuesComponent } from './lib/property-values.component';
import { BaseSwitchComponent } from './lib/switch-components/base-switch.component';
import { ColorSwitchComponent } from './lib/switch-components/color-switch.component';
import { DateSwitchComponent } from './lib/switch-components/date-switch.component';
import { GeonameSwitchComponent } from './lib/switch-components/geoname-switch.component';
import { IntervalSwitchComponent } from './lib/switch-components/interval-switch.component';
import { LinkSwitchComponent } from './lib/switch-components/link-switch.component';
import { ListSwitchComponent } from './lib/switch-components/list-switch.component';
import { RichTextSwitchComponent } from './lib/switch-components/rich-text-switch.component';
import { TextHtmlSwitchComponent } from './lib/switch-components/text-html-switch.component';
import { TextSwitchComponent } from './lib/switch-components/text-switch.component';
import { TextTypesSelectorComponent } from './lib/switch-components/text-types-selector.component';
import { TimeSwitchComponent } from './lib/switch-components/time-switch.component';
import { ToggleSwitchComponent } from './lib/switch-components/toggle-switch.component';
import { UriSwitchComponent } from './lib/switch-components/uri-switch.component';
import { UploadControlComponent } from './lib/upload-control.component';
import { UploadComponent } from './lib/upload.component';
import { GeonameValueComponent } from './lib/value-components/geoname-value.component';
import { LinkValueComponent } from './lib/value-components/link-value.component';
import { ListValueComponent } from './lib/value-components/list-value.component';
import { NestedMenuComponent } from './lib/value-components/nested-menu.component';
import { TimeValueComponent } from './lib/value-components/time-value.component';
import { RichTextViewerComponent } from './lib/viewer-components/rich-text-viewer.component';

const valueComponents = [
  GeonameValueComponent,
  LinkValueComponent,
  ListValueComponent,
  NestedMenuComponent,
  TimeValueComponent,
];

const viewerComponents = [RichTextViewerComponent];

const switchComponents = [
  TimeSwitchComponent,
  ColorSwitchComponent,
  IntervalSwitchComponent,
  LinkSwitchComponent,
  UriSwitchComponent,
  GeonameSwitchComponent,
  ListSwitchComponent,
  DateSwitchComponent,
  BaseSwitchComponent,
  RichTextSwitchComponent,
  ToggleSwitchComponent,
  TextSwitchComponent,
  TextHtmlSwitchComponent,
];

export const ResourcePropertiesComponents = [
  ...switchComponents,
  ...valueComponents,
  ...viewerComponents,
  TextTypesSelectorComponent,
  DeleteValueDialogComponent,
  PropertyValuesComponent,
  PropertyValueSwitcherComponent,
  PropertyValueActionBubbleComponent,
  PropertyValueComponent,
  ExistingPropertyValueComponent,
  CreateResourceDialogComponent,
  CreateResourcePageComponent,
  CreateResourceFormComponent,
  UploadControlComponent,
  PropertyValueCommentComponent,
  EditResourceLabelDialogComponent,
  EraseResourceDialogComponent,
  PropertyRowComponent,
  UploadComponent,
  FootnotesComponent,
  FootnoteTooltipComponent,
  FootnoteDirective,
  FootnoteParserPipe,
  MathJaxDirective,
];
