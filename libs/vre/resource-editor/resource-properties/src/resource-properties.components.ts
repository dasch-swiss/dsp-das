import { AuthorshipFormFieldComponent } from './lib/authorship-form-field.component';
import { CreateResourceDialogComponent } from './lib/create-resource-dialog.component';
import { CreateResourceFormFileComponent } from './lib/create-resource-form-file.component';
import { CreateResourceFormImageComponent } from './lib/create-resource-form-image.component';
import { CreateResourceFormPropertiesComponent } from './lib/create-resource-form-properties.component';
import { CreateResourceFormRepresentationComponent } from './lib/create-resource-form-representation.component';
import { CreateResourceFormRowComponent } from './lib/create-resource-form-row.component';
import { CreateResourceFormComponent } from './lib/create-resource-form.component';
import { CreateResourcePageComponent } from './lib/create-resource-page.component';
import { DeleteValueDialogComponent } from './lib/delete-value-dialog.component';
import { EditResourceLabelDialogComponent } from './lib/edit-resource-label-dialog.component';
import { EraseResourceDialogComponent } from './lib/erase-resource-dialog.component';
import { FootnoteParserPipe } from './lib/footnote-parser.pipe';
import { FootnoteTooltipComponent } from './lib/footnote-tooltip.component';
import { FootnoteDirective } from './lib/footnote.directive';
import { FootnotesComponent } from './lib/footnotes.component';
import { MathJaxDirective } from './lib/mathjax/math-jax.directive';
import { PropertyRowComponent } from './lib/property-row.component';
import { PropertyValueActionBubbleComponent } from './lib/property-value-action-bubble.component';
import { PropertyValueCommentComponent } from './lib/property-value-comment.component';
import { PropertyValueCreatorComponent } from './lib/property-value-creator.component';
import { PropertyValueDisplayComponent } from './lib/property-value-display.component';
import { PropertyValueEditComponent } from './lib/property-value-edit.component';
import { PropertyValueToFormComponent } from './lib/property-value-to-form.component';
import { PropertyValueComponent } from './lib/property-value.component';
import { PropertyValuesComponent } from './lib/property-values.component';
import { ResourceFormLegalComponent } from './lib/resource-form-legal.component';
import { BaseSwitchComponent } from './lib/switch-components/base-switch.component';
import { ColorSwitchComponent } from './lib/switch-components/color-switch.component';
import { IntervalSwitchComponent } from './lib/switch-components/interval-switch.component';
import { ListSwitchComponent } from './lib/switch-components/list-switch.component';
import { RichTextSwitchComponent } from './lib/switch-components/rich-text-switch.component';
import { TextHtmlSwitchComponent } from './lib/switch-components/text-html-switch.component';
import { TextSwitchComponent } from './lib/switch-components/text-switch.component';
import { TimeSwitchComponent } from './lib/switch-components/time-switch.component';
import { TemplateEditorSwitcherComponent } from './lib/template-editor-switcher.component';
import { TemplateViewerSwitcherComponent } from './lib/template-viewer-switcher.component';
import { UploadControlComponent } from './lib/upload-control.component';
import { UploadComponent } from './lib/upload.component';
import { UploadedFileComponent } from './lib/uploaded-file.component';
import { GeonameValueComponent } from './lib/value-components/geoname-value.component';
import { IntervalValueComponent } from './lib/value-components/interval-value.component';
import { LinkValueComponent } from './lib/value-components/link-value.component';
import { ListValueComponent } from './lib/value-components/list-value.component';
import { NestedMenuComponent } from './lib/value-components/nested-menu.component';
import { TimeValueComponent } from './lib/value-components/time-value.component';
import { ToggleValueComponent } from './lib/value-components/toggle-value.component';
import { DateViewerComponent } from './lib/viewer-components/date-viewer.component';
import { GeonameViewerComponent } from './lib/viewer-components/geoname-viewer.component';
import { IntervalViewerComponent } from './lib/viewer-components/interval-viewer.component';
import { LinkViewerComponent } from './lib/viewer-components/link-viewer.component';
import { ListViewerComponent } from './lib/viewer-components/list-viewer.component';
import { RichTextViewerComponent } from './lib/viewer-components/rich-text-viewer.component';
import { TimeViewerComponent } from './lib/viewer-components/time-viewer.component';

const valueComponents = [
  GeonameValueComponent,
  LinkValueComponent,
  ListValueComponent,
  NestedMenuComponent,
  TimeValueComponent,
  IntervalValueComponent,
];

const viewerComponents = [RichTextViewerComponent, ListViewerComponent, IntervalViewerComponent, TimeViewerComponent];

const switchComponents = [
  TimeSwitchComponent,
  ColorSwitchComponent,
  IntervalSwitchComponent,
  LinkViewerComponent,
  GeonameViewerComponent,
  ListSwitchComponent,
  DateViewerComponent,
  BaseSwitchComponent,
  RichTextSwitchComponent,
  ToggleValueComponent,
  TextSwitchComponent,
  TextHtmlSwitchComponent,
];

export const ResourcePropertiesComponents = [
  ...switchComponents,
  ...valueComponents,
  ...viewerComponents,
  DeleteValueDialogComponent,
  PropertyValuesComponent,
  PropertyValueActionBubbleComponent,
  PropertyValueComponent,
  PropertyValueEditComponent,
  PropertyValueDisplayComponent,
  PropertyValueToFormComponent,
  CreateResourceDialogComponent,
  CreateResourcePageComponent,
  CreateResourceFormComponent,
  ResourceFormLegalComponent,
  CreateResourceFormRepresentationComponent,
  CreateResourceFormPropertiesComponent,
  CreateResourceFormRowComponent,
  CreateResourceFormImageComponent,
  CreateResourceFormFileComponent,
  UploadControlComponent,
  PropertyValueCommentComponent,
  EditResourceLabelDialogComponent,
  EraseResourceDialogComponent,
  PropertyRowComponent,
  UploadComponent,
  UploadedFileComponent,
  FootnotesComponent,
  FootnoteTooltipComponent,
  FootnoteDirective,
  FootnoteParserPipe,
  AuthorshipFormFieldComponent,
  MathJaxDirective,

  TemplateEditorSwitcherComponent,
  TemplateViewerSwitcherComponent,
  PropertyValueCreatorComponent,
];
