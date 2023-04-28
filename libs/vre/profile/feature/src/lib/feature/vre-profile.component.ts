import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyTabsModule } from "@angular/material/legacy-tabs";
import { RouterLinkActive } from "@angular/router";

@Component({
    selector: 'dsp-vre-profile',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatLegacyTabsModule, RouterLinkActive],
    templateUrl: './vre-profile.component.html',
    styleUrls: ['./vre-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VreProfileComponent {}
