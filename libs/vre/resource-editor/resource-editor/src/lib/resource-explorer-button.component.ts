import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherDialogComponent } from './resource-fetcher-dialog.component';

@Component({
  selector: 'app-resource-explorer-button',
  template: `<button
    mat-icon-button
    (click)="tryDialog()"
    style="
    color: #646465;
    transform: scale(0.8);
    position: relative;
    top: -15px;">
    <mat-icon>arrow_circle_right</mat-icon>
  </button>`,
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  styles: [
    `
      :host {
        display: block;
        height: 0;
      }
    `,
  ],
})
export class ResourceExplorerButtonComponent {
  @Input({ required: true }) resourceIri!: string;
  constructor(private readonly _dialog: MatDialog) {}
  tryDialog() {
    this._dialog.open(ResourceFetcherDialogComponent, {
      ...DspDialogConfig.dialogDrawerConfig({ resourceIri: this.resourceIri }, true),
      width: `${1200 - this._dialog.openDialogs.length * 40}px`,
    });
  }
}
