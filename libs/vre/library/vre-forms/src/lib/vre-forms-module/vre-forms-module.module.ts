import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DspFormComponent} from "@dasch-swiss/vre/library/vre-forms";
import {
    GenericTextFormComponentNComponent
} from "./dsp-form-component/generic-text-form-component-n/generic-text-form-component-n.component";
import {
    AddRemoveFormComponentComponent
} from "./dsp-form-component/add-remove-form-component/add-remove-form-component.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";



@NgModule({
  declarations: [
      DspFormComponent,
      GenericTextFormComponentNComponent,
      AddRemoveFormComponentComponent
  ],
  imports: [
    CommonModule,
      FormsModule,
      MatButtonModule,
      MatInputModule,
      MatIconModule,
      MatFormFieldModule,
      ReactiveFormsModule
  ],
    exports: [
        DspFormComponent
        ]
})
export class VreFormsModuleModule { }
