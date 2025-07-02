import { CreateResourceDialogComponent } from './lib/create-resource-dialog.component';
import { DeleteValueDialogComponent } from './lib/delete-value-dialog.component';
import { EditResourceLabelDialogComponent } from './lib/edit-resource-label-dialog.component';
import { EraseResourceDialogComponent } from './lib/erase-resource-dialog.component';
import { FootnoteParserPipe } from './lib/footnote-parser.pipe';
import { FootnoteTooltipComponent } from './lib/footnote-tooltip.component';
import { FootnoteDirective } from './lib/footnote.directive';
import { FootnotesComponent } from './lib/footnotes.component';
import { MathJaxDirective } from './lib/mathjax/math-jax.directive';
import { NullableEditorComponent } from './lib/nullable-editor.component';
import { PropertyRowComponent } from './lib/property-row.component';
import { PropertyValueActionBubbleComponent } from './lib/property-value-action-bubble.component';
import { PropertyValueBasicCommentComponent } from './lib/property-value-basic-comment.component';
import { PropertyValueCommentComponent } from './lib/property-value-comment.component';
import { PropertyValueDisplayComponent } from './lib/property-value-display.component';
import { PropertyValueEditComponent } from './lib/property-value-edit.component';
import { PropertyValueToFormComponent } from './lib/property-value-to-form.component';
import { PropertyValueComponent } from './lib/property-value.component';
import { PropertyValuesComponent } from './lib/property-values.component';
import { UploadControlComponent } from './lib/upload-control.component';
import { UploadComponent } from './lib/upload.component';
import { UploadedFileComponent } from './lib/uploaded-file.component';

export const ResourcePropertiesComponents = [
  DeleteValueDialogComponent,
  PropertyValuesComponent,
  PropertyValueActionBubbleComponent,
  PropertyValueComponent,
  PropertyValueEditComponent,
  PropertyValueDisplayComponent,
  PropertyValueToFormComponent,
  CreateResourceDialogComponent,
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
  MathJaxDirective,

  NullableEditorComponent,
  PropertyValueBasicCommentComponent,
];
