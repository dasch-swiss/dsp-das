import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { VreProjectEditComponent } from "./project-editor/project-edit/vre-project-edit.component";
import { VreProjectsComponent } from './vre-projects.component';
import { VreProjectsListComponent } from '@dasch-swiss/vre/library/vre-projects';
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatButtonModule} from "@angular/material/button";
import {VreFormsModuleModule} from "../../../../vre-forms/src/lib/vre-forms-module/vre-forms-module.module";
import {DspFormComponent} from "@dasch-swiss/vre/library/vre-forms";
import {MatDividerModule} from "@angular/material/divider";


@NgModule({
  declarations: [
      VreProjectsComponent,
      VreProjectsListComponent,
      VreProjectEditComponent,
  ],
    imports: [
        CommonModule,
        MatMenuModule,
        MatIconModule,
        MatChipsModule,
        MatButtonModule,
        VreFormsModuleModule,
        MatDividerModule,
    ],
    exports: [
        VreProjectsComponent
    ]
})
export class VreProjectsModule { }
