import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AppProgressIndicatorComponent } from "./app-progress-indicator/app-progress-indicator.component";

@NgModule({
    declarations: [
        AppProgressIndicatorComponent
    ],
    imports: [
        CommonModule,
        MatIconModule
    ],
    exports: [
        AppProgressIndicatorComponent
    ]
})
export class AppProgressIndicatorModule { }
