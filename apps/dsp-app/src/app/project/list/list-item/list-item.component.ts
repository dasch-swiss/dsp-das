import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ListChildNodeResponse,
  ListNode,
  ListResponse,
  RepositionChildNodeRequest,
  StringLiteral,
} from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { take } from 'rxjs/operators';
import { ListNodeOperation } from '../list-item-form/list-item-form.component';

@Component({
  selector: 'app-list-item',
  template: `
    <app-list-item-element
      *ngFor="let child of children; let index = index; let first = first; let last = last"
      [position]="index"
      [length]="children.length"
      [node]="child"
      [language]="language"
      [childNode]="true"
      [parentIri]="child.id"
      [isAdmin]="isAdmin"
      [projectIri]="projectIri"
      [projectUuid]="projectUuid"
      [projectStatus]="projectStatus"></app-list-item-element>
    <!-- new list to create if list is empty -->
    <app-list-item-form
      style="display: block; margin-left: 46px"
      [parentIri]="parentIri"
      [projectIri]="projectIri"
      [projectUuid]="projectUuid"></app-list-item-form>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ListItemComponent implements OnInit {
  @Input() list: ListNode[];

  @Input() parentIri?: string;

  @Input() projectUuid: string;
  @Input() projectStatus: boolean;

  @Input() projectIri: string;

  @Input() childNode: boolean;

  @Input() language?: string;

  @Output() refreshChildren: EventEmitter<ListNode[]> = new EventEmitter<ListNode[]>();

  // permissions of logged-in user
  @Input() isAdmin = false;

  expandedNode: string;

  children: ListNode[] = [];
  labels: StringLiteral[] = [];

  constructor(
    private _listApiService: ListApiService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // in case of parent node: run the following request to get the entire list
    this._listApiService
      .get(this.parentIri)
      .pipe(take(1))
      .subscribe(result => {
        if (result['node']) {
          this.children = (result as ListChildNodeResponse).node.children;
          this.labels = (result as ListChildNodeResponse).node.nodeinfo.labels;
        } else {
          this.language = (result as ListResponse).list.listinfo.labels[0].language;
          this.children = (result as ListResponse).list.children;
          this.labels = (result as ListResponse).list.listinfo.labels;
        }
        this._cd.markForCheck();
      });
  }

  /**
   * called when the 'refreshParent' event from ListItemFormComponent is triggered.
   *
   * @param data info about the operation that was performed on the node and should be reflected in the UI.
   * @param firstNode states whether the node is a new child node; defaults to false.
   */
  updateView(data: ListNodeOperation, firstNode = false) {
    // update the view by updating the existing list
    if (data instanceof ListNodeOperation) {
      switch (data.operation) {
        case 'create': {
          if (firstNode) {
            // in case of new child node, we have to use the children from list
            const index: number = this.list.findIndex(item => item.id === this.expandedNode);
            this.list[index].children.push(data.listNode);
          } else {
            this.list.push(data.listNode);
          }
          break;
        }
        case 'insert': {
          // get the corresponding list from the API again and reassign the local list with its response
          this._listApiService.get(this.parentIri).subscribe(response => {
            if (response instanceof ListResponse) {
              this.list = response.list.children; // root node
            } else {
              this.list = response.node.children; // child node
            }

            // emit the updated list of children to the parent node
            this.refreshChildren.emit(this.list);
          });
          break;
        }
        case 'update': {
          // use the position from the response from DSP-API to find the correct node to update
          this.list[data.listNode.position].labels = data.listNode.labels;
          this.list[data.listNode.position].comments = data.listNode.comments;
          break;
        }
        case 'delete': {
          // conveniently, the response returned by DSP-API contains the entire list without the deleted node within its 'children'
          // we can just reassign the list to this
          this.list = data.listNode.children;

          // emit the updated list of children to the parent node
          this.refreshChildren.emit(this.list);
          break;
        }
        case 'reposition': {
          const repositionRequest: RepositionChildNodeRequest = new RepositionChildNodeRequest();
          repositionRequest.parentNodeIri = this.parentIri;
          repositionRequest.position = data.listNode.position;

          // since we don't have any way to know the parent IRI from the ListItemForm component, we need to do the API call here
          // --> TODO now we have the parent IRI within the ListItemForm component so we can move this logic there
          this._listApiService.repositionChildNode(data.listNode.id, repositionRequest).subscribe(response => {
            this.list = response.node.children;
            this.refreshChildren.emit(this.list);
          });
          break;
        }
        default: {
          break;
        }
      }
    }
  }

  /**
   * updates the children of the parent node
   *
   * @param children the updated list of children nodes
   * @param position the position of the parent node
   */
  updateParentNodeChildren(children: ListNode[], position: number) {
    this.list[position].children = children;
  }
}
