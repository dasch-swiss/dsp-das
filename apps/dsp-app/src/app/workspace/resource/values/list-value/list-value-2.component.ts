import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraApiConnection, ListNodeV2, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

@Component({
  selector: 'app-list-value-2',
  template:
    ' <app-nested-menu *ngIf="listRootNode" [data]="listRootNode" [selection]="mySelectedNode?.label" (selectedNode)="selectedNode($event)"></app-nested-menu> ',
})
export class ListValue2Component implements OnInit {
  @Input() propertyDef: ResourcePropertyDefinition;
  @Input() control: FormControl<string>;
  listRootNode: ListNodeV2;
  mySelectedNode: ListNodeV2;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._loadRootNodes();
  }

  selectedNode(node: ListNodeV2) {
    this.mySelectedNode = node;
    this.control.patchValue(node.id);
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
