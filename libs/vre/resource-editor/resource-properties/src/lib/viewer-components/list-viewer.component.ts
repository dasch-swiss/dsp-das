import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraApiConnection, ListNodeV2, ResourcePropertyDefinition } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ListsSelectors } from '@dasch-swiss/vre/core/state';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-list-viewer',
  template: `
    <span
      data-cy="list-switch"
      style="display: flex;
    align-items: center;">
      <ng-container *ngFor="let label of labels$ | async; let last = last; let index = index"
        ><span [ngStyle]="{ 'font-weight': last && index > 0 ? 'bold' : 'normal' }">{{ label }}</span>
        <mat-icon *ngIf="!last">chevron_right</mat-icon>
      </ng-container>
      <a [href]="href2" target="_blank"><mat-icon>search</mat-icon></a>
    </span>
  `,
})
export class ListViewerComponent implements OnInit {
  @Input() control!: FormControl<string>;
  @Input() propertyDef!: ResourcePropertyDefinition;
  labels$!: Observable<string[]>;

  href = 'TOCHANGE';

  href2 = '';

  nodeIdSubject = new Subject<string>();

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _resourceFetcher: ResourceFetcherService,
    private _store: Store,
    private _listApiService: ListApiService
  ) {}

  ngOnInit() {
    console.log(this.href2);
    console.log(this.propertyDef);
    this._getFetcher();
    if (!this.control.value) {
      return;
    }

    this.labels$ = (this._dspApiConnection.v2.list.getNode(this.control.value) as Observable<ListNodeV2>).pipe(
      switchMap(v => this._dspApiConnection.v2.list.getList(v.hasRootNode!)),
      map(v => {
        const tree = ListViewerComponent.lookFor([v as ListNodeV2], this.control.value);
        const finalTree = tree as ListNodeV2[];
        const nodeId = finalTree[finalTree.length - 1].id;
        console.log('nodeId', nodeId);
        this.nodeIdSubject.next(nodeId);
        return (tree as ListNodeV2[]).slice(1).map(node => node.label);
      })
    );
  }

  private _getFetcher() {
    this._store.select(ListsSelectors.listsInProject).subscribe(v => {
      console.log('list', v);
      console.log(this.propertyDef.guiAttributes[0]);

      const match = this.propertyDef.guiAttributes[0].match(/hlist=<([^>]+)>/);
      console.log(match[1]); // Outputs: http://rdfh.ch/lists/0803/Gw_DTkBUT96HMlJVpD-Qrg
    });

    combineLatest([this._resourceFetcher.resource$, this.nodeIdSubject.asObservable()]).subscribe(([v, nodeId]) => {
      console.log(v);
      this.href = `
   PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
PREFIX incunabula: <http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#>
CONSTRUCT {
?mainRes knora-api:isMainResource true .
?mainRes <${this.propertyDef.id}> ?prop0 .
} WHERE {
?mainRes a knora-api:Resource .
?mainRes a <http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#s> .
?mainRes <${this.propertyDef.id}> ?prop0 .
?prop0 <http://api.knora.org/ontology/knora-api/v2#listValueAsListNode> <${nodeId}> .

}

OFFSET 0`;

      this.href2 = `/project/3ABR_2i8QYGSIDvmP9mlEw/advanced-search/gravsearch/${encodeURIComponent(this.href)}`;
    });
  }

  static lookFor(tree: ListNodeV2[], id: string): ListNodeV2[] | null {
    const node = tree[tree.length - 1];
    if (node.id === id) {
      return tree;
    }
    for (const childNode of node.children) {
      const found = ListViewerComponent.lookFor([...tree, childNode], id);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }
}
