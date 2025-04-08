import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { KnoraApiConnection, ListNodeV2 } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { Observable } from 'rxjs';
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
  labels$!: Observable<string[]>;

  href = `
   PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
PREFIX incunabula: <http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#>
CONSTRUCT {
?mainRes knora-api:isMainResource true .
?mainRes <http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#ll> ?prop0 .
} WHERE {
?mainRes a knora-api:Resource .
?mainRes a <http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#s> .
?mainRes <http://api.dev.dasch.swiss/ontology/0803/incunabula/v2#ll> ?prop0 .
?prop0 <http://api.knora.org/ontology/knora-api/v2#listValueAsListNode> <http://rdfh.ch/lists/0803/TD5vyRHvSqiyeq9JBnVAOw> .

}

OFFSET 0`;

  href2 = `/project/3ABR_2i8QYGSIDvmP9mlEw/advanced-search/gravsearch/${encodeURIComponent(this.href)}`;

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  ngOnInit() {
    console.log(this.href2);
    if (!this.control.value) {
      return;
    }

    this.labels$ = (this._dspApiConnection.v2.list.getNode(this.control.value) as Observable<ListNodeV2>).pipe(
      switchMap(v => this._dspApiConnection.v2.list.getList(v.hasRootNode!)),
      map(v => {
        const tree = ListViewerComponent.lookFor([v as ListNodeV2], this.control.value);
        return (tree as ListNodeV2[]).slice(1).map(node => node.label);
      })
    );
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
