import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  ApiResponseError,
  ChildNodeInfo,
  CreateChildNodeRequest,
  KnoraApiConnection,
  ListInfoResponse,
  ListNode,
  ListNodeInfoResponse,
  StringLiteral,
} from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { CreateListItemDialogComponent } from '@dsp-app/src/app/project/list/list-item-form/edit-list-item/create-list-item-dialog.component';
import { filter, switchMap } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../../main/action/confirm-dialog/confirm-dialog.component';
import { DialogComponent } from '../../../main/dialog/dialog.component';

export class ListNodeOperation {
  operation: 'create' | 'insert' | 'update' | 'delete' | 'reposition';
  listNode: ListNode;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list-item-form',
  templateUrl: './list-item-form.component.html',
  styleUrls: ['./list-item-form.component.scss'],
  animations: [
    // the fade-in/fade-out animation.
    // https://www.kdechant.com/blog/angular-animations-fade-in-and-fade-out
    trigger('simpleFadeAnimation', [
      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({ opacity: 1 })),

      // fade in when created.
      transition(':enter', [
        // the styles start from this point when the element appears
        style({ opacity: 0 }),
        // and animate toward the "in" state above
        animate(150),
      ]),

      // fade out when destroyed.
      transition(
        ':leave',
        // fading out uses a different syntax, with the "style" being passed into animate()
        animate(150, style({ opacity: 0 }))
      ),
    ]),
  ],
})
export class ListItemFormComponent implements OnInit {
  /**
   * node id, in case of edit item
   */
  @Input() iri?: string;

  /**
   * project uuid
   */
  @Input() projectUuid?: string;

  /**
   * project status
   */
  @Input() projectStatus?: boolean;

  /**
   * project id
   */
  @Input() projectIri?: string;

  /**
   * parent node id
   */
  @Input() parentIri?: string;

  @Input() labels?: StringLiteral[];

  // set main / pre-defined language
  @Input() language?: string;

  @Input() position: number;

  // is this node in the last position of the list
  @Input() lastPosition = false;

  @Input() newNode = false;

  @Output() refreshParent: EventEmitter<ListNodeOperation> = new EventEmitter<ListNodeOperation>();

  @Input() isAdmin = false;

  loading: boolean;

  initComponent: boolean;

  placeholder = 'Append item to ';

  showActionBubble = false;

  constructor(
    private _listApiService: ListApiService,
    private _errorHandler: AppErrorHandler,
    private _dialog: MatDialog,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initComponent = true;

    if (this.labels && this.labels.length > 0) {
      this.placeholder = 'Edit item ';
    }

    // it can be used in the input placeholder
    if (this.newNode) {
      this._listApiService.getNodeInfo(this.parentIri).subscribe(response => {
        console.log(response);
        if (response['listinfo']) {
          // root node
          this.placeholder += (response as ListInfoResponse).listinfo.labels[0].value;
        } else {
          // child node
          this.placeholder += (response as ListNodeInfoResponse).nodeinfo.labels[0].value;
        }

        this.initComponent = false;
        this._cd.markForCheck();
      });
    }
  }

  /**
   * called from the template when the plus button is clicked.
   * Sends the info to make a new child node to DSP-API and refreshes the UI to show the newly added node at the end of the list.
   */
  createChildNode() {
    if (!this.labels.length) {
      return;
    }

    this.loading = true;

    // generate the data payload
    const childNode: CreateChildNodeRequest = new CreateChildNodeRequest();
    childNode.parentNodeIri = this.parentIri;
    childNode.projectIri = this.projectIri;
    childNode.name = `${this.projectUuid}-${Math.random().toString(36).substring(2)}${Math.random()
      .toString(36)
      .substring(2)}`;

    // initialize labels
    let i = 0;
    for (const l of this.labels) {
      childNode.labels[i] = new StringLiteral();
      childNode.labels[i].language = l.language;
      childNode.labels[i].value = l.value;
      i++;
    }
    // childNode.comments = []; // --> TODO comments are not yet implemented in the template

    // init data to emit to parent
    const listNodeOperation: ListNodeOperation = new ListNodeOperation();

    // send payload to dsp-api's api
    this._listApiService.createChildNode(childNode.parentNodeIri, childNode).subscribe(response => {
      // this needs to return a ListNode as opposed to a ListNodeInfo, so we make one
      listNodeOperation.listNode = new ListNode();
      listNodeOperation.listNode.hasRootNode = response.nodeinfo.hasRootNode;
      listNodeOperation.listNode.id = response.nodeinfo.id;
      listNodeOperation.listNode.labels = response.nodeinfo.labels;
      listNodeOperation.listNode.name = response.nodeinfo.name;
      listNodeOperation.listNode.position = response.nodeinfo.position;
      listNodeOperation.operation = 'create';
      this.refreshParent.emit(listNodeOperation);
      this.loading = false;
    });
  }

  /**
   * called from the template any time the label changes.
   * Currently only implemented for labels because entering comments is not yet supported.
   *
   * @param data the data that was changed.
   */
  handleData(data: StringLiteral[]) {
    // this shouldn't run on the init...
    if (!this.initComponent) {
      this.labels = data;
    }
  }

  /**
   * show action bubble with various CRUD buttons when hovered over.
   */
  mouseEnter() {
    if (this.isAdmin) {
      this.showActionBubble = true;
    }
  }

  /**
   * hide action bubble with various CRUD buttons when not hovered over.
   */
  mouseLeave() {
    this.showActionBubble = false;
  }

  askToDeleteListNode(name: string, iri: string) {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: name,
          message: 'Do you want to delete this node?',
        },
      })
      .afterClosed()
      .pipe(
        filter(response => typeof response === 'boolean' && response === true),
        switchMap(() => this._listApiService.deleteListNode(iri))
      )
      .subscribe(response => {
        const listNodeOperation = new ListNodeOperation();

        listNodeOperation.listNode = response.node;
        listNodeOperation.operation = 'delete';

        // emit data to parent to update the view
        this.refreshParent.emit(listNodeOperation);
      });
  }

  /**
   * called when the 'edit' or 'delete' button is clicked.
   *
   * @param mode mode to tell DialogComponent which part of the template to show.
   * @param name label of the node; for now this is always the first label in the array.
   * @param iri iri of the node.
   */

  askToInsertNode(iri: string) {
    this._dialog
      .open(CreateListItemDialogComponent, {
        width: '100%',
        minWidth: 500,
        data: {
          id: iri,
          project: this.projectIri,
          parentIri: this.parentIri,
          position: this.position,
        },
      })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(response => {
        const listNodeOperation = new ListNodeOperation();
        listNodeOperation.listNode = response as ListNode;
        listNodeOperation.operation = 'insert';
        this.refreshParent.emit(listNodeOperation);
      });
  }

  askToEditNode(iri: string) {
    this._dialog
      .open(CreateListItemDialogComponent, {
        width: '100%',
        minWidth: 500,
        data: {
          id: iri,
          project: this.projectIri,
          parentIri: this.parentIri,
          position: this.position,
        },
      })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(response => {
        const listNodeOperation = new ListNodeOperation();
        listNodeOperation.listNode = response as ListNode;
        listNodeOperation.operation = 'update';

        // emit data to parent to update the view
        this.refreshParent.emit(listNodeOperation);
        this.labels = (response as ChildNodeInfo).labels;
      });
  }

  /**
   * called from the template when either of the two reposition buttons is clicked
   * @param direction in which direction the node should move
   */
  repositionNode(direction: 'up' | 'down') {
    const listNodeOperation = new ListNodeOperation();

    listNodeOperation.operation = 'reposition';
    listNodeOperation.listNode = new ListNode();

    // set desired node position
    if (direction === 'up') {
      listNodeOperation.listNode.position = this.position - 1;
    } else {
      listNodeOperation.listNode.position = this.position + 1;
    }

    listNodeOperation.listNode.id = this.iri;

    this.refreshParent.emit(listNodeOperation);
  }
}
