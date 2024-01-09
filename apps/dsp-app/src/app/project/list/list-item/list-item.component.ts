import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ListChildNodeResponse, ListNode, ListResponse, StringLiteral } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { startWith, switchMap } from 'rxjs/operators';
import { ListItemService } from './list-item.service';

@Component({
  selector: 'app-list-item',
  template: `
    <app-list-item-element
      *ngFor="let child of children; let index = index; let first = first; let last = last"
      [position]="index"
      [length]="children.length"
      [node]="child"
      [isAdmin]="isAdmin"></app-list-item-element>
    <app-list-item-form style="display: block; margin-left: 46px"></app-list-item-form>
  `,
  styles: [':host { display: block; }'],
  providers: [ListItemService],
})
export class ListItemComponent implements OnInit {
  @Input() rootNodeIri: string;
  @Input() projectUuid: string;
  @Input() isAdmin = false;

  children: ListNode[] = [];
  labels: StringLiteral[] = [];

  constructor(
    private _listApiService: ListApiService,
    public listItemService: ListItemService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.listItemService.setProjectInfos(this.projectUuid, this.rootNodeIri);

    this.listItemService.onUpdate$
      .pipe(
        startWith(true),
        switchMap(() => this._listApiService.get(this.rootNodeIri))
      )
      .subscribe(result => {
        if (result['node']) {
          this.children = (result as ListChildNodeResponse).node.children;
          this.labels = (result as ListChildNodeResponse).node.nodeinfo.labels;
        } else {
          this.children = (result as ListResponse).list.children;
          this.labels = (result as ListResponse).list.listinfo.labels;
        }
        this._cd.markForCheck();
      });
  }
}
