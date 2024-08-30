import { AdminImageDirective } from './lib/admin-image/admin-image.directive';
import { CenteredLayoutComponent } from './lib/centered-layout.component';
import { ChipListInputComponent } from './lib/chip-list-input.component';
import { CkEditorControlComponent } from './lib/ck-editor/ck-editor-control.component';
import { CkEditorComponent } from './lib/ck-editor/ck-editor.component';
import { ColorPickerComponent } from './lib/color-picker/color-picker.component';
import { CommonInputComponent } from './lib/common-input.component';
import { DateValueHandlerComponent } from './lib/date-value-handler/date-value-handler.component';
import { ConfirmDialogComponent } from './lib/dialog/confirm-dialog.component';
import { DragDropDirective } from './lib/directives/drag-drop.directive';
import { TextValueHtmlLinkDirective } from './lib/directives/text-value-html-link.directive';
import { InvalidControlScrollDirective } from './lib/invalid-control-scroll.directive';
import { JDNDatepickerDirective } from './lib/jdn-datepicker-directive/jdndatepicker.directive';
import { PagerComponent } from './lib/pager/pager.component';
import { StatusComponent } from './lib/status/status.component';
import { TimeFormatPipe } from './lib/time-format.pipe';
import { TimeFormatDirective } from './lib/time-input/time-format.directive';
import { TimeInputComponent } from './lib/time-input/time-input.component';

export const UiComponents = [
  ConfirmDialogComponent,
  TimeInputComponent,
  TimeFormatDirective,
  TimeFormatPipe,
  CkEditorComponent,
  CkEditorControlComponent,
  InvalidControlScrollDirective,
  ChipListInputComponent,
  CommonInputComponent,
  ColorPickerComponent,
  DateValueHandlerComponent,
  JDNDatepickerDirective,
  StatusComponent,
  AdminImageDirective,
  CenteredLayoutComponent,
  TextValueHtmlLinkDirective,
  DragDropDirective,
];
export const UiStandaloneComponents = [PagerComponent];
