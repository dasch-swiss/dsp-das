import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { KnoraApiConnection, ListNodeV2, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

@Component({
  selector: 'app-list-value-2',
  template: `
    <button mat-button [matMenuTriggerFor]="rootNodesMenu" *ngIf="listRootNode">{{ listRootNode.label }}</button>
    <mat-menu #rootNodesMenu="matMenu">
      <button mat-menu-item *ngFor="let node of listRootNode?.children" [matMenuTriggerFor]="vertebrates">
        {{ node.label }}
      </button>
    </mat-menu>

    <mat-menu #vertebrates="matMenu">
      <button mat-menu-item>Birds</button>
      <button mat-menu-item>Mammals</button>
    </mat-menu>
  `,
})
export class ListValue2Component implements OnInit {
  @Input() propertyDef: ResourcePropertyDefinition;
  listRootNode: ListNodeV2;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._loadRootNodes();
  }

  private _loadRootNodes(): void {
    const rootNodeIris = this.propertyDef.guiAttributes;
    for (const rootNodeIri of rootNodeIris) {
      const trimmedRootNodeIRI = rootNodeIri.substring(7, rootNodeIri.length - 1);
      this._dspApiConnection.v2.list.getList(trimmedRootNodeIRI).subscribe((response: ListNodeV2) => {
        // TODO weird to have n subscribes inside ngFors
        this.listRootNode = response;
        this._cd.detectChanges();
        console.log('root node set', this.listRootNode);
      });
    }
  }
}
