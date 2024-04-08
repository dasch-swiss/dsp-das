import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraApiConnection, ListNodeV2, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { SwitchComponent } from './switch-component.interface';

@Component({
  selector: 'app-list-switch',
  template: `
    <ng-container *ngIf="displayMode; else editMode">
      <span class="rm-value list">
        <span class="hierarchy" *ngFor="let item of selectedNodeHierarchy; let first = first; let last = last">
          <mat-icon *ngIf="!first">chevron_right</mat-icon>
          <span [class.last]="last">{{ item }}</span>
        </span>
      </span>
    </ng-container>
    <ng-template #editMode>
      <app-list-value-2 [control]="control" [propertyDef]="propertyDef"></app-list-value-2>
    </ng-template>
  `,
})
export class ListSwitchComponent implements SwitchComponent {
  @Input() control!: FormControl<string>;
  @Input() displayMode = true;
  @Input() propertyDef!: ResourcePropertyDefinition;

  selectedNodeHierarchy: string[] = [];

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cd: ChangeDetectorRef
  ) {}

  getReadModeValue(nodeIri: string): void {
    const rootNodeIri = this.control.value; // TODO this.propertyDef.guiAttributes;
    const trimmedRootNodeIRI = rootNodeIri.substring(7, rootNodeIri.length - 1);
    this._dspApiConnection.v2.list.getList(trimmedRootNodeIRI).subscribe((response: ListNodeV2) => {
      if (!response.children.length) {
        // this shouldn't happen since users cannot select the root node
        this.selectedNodeHierarchy.push(response.label);
      } else {
        this.selectedNodeHierarchy = this._getHierarchy(nodeIri, response.children);
      }
      this._cd.markForCheck();
    });
  }

  private _getHierarchy(selectedNodeIri: string, children: ListNodeV2[]): string[] {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.id !== selectedNodeIri) {
        if (node.children) {
          const path = this._getHierarchy(selectedNodeIri, node.children);

          if (path) {
            path.unshift(node.label);
            return path;
          }
        }
      } else {
        return [node.label];
      }
    }
  }
}
