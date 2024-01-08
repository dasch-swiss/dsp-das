import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CreateChildNodeRequest,
  ListInfoResponse,
  ListNode,
  ListNodeInfoResponse,
  StringLiteral,
} from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { atLeastOneStringRequired } from '@dsp-app/src/app/project/reusable-project-form/at-least-one-string-required.validator';

export class ListNodeOperation {
  operation: 'create' | 'insert' | 'update' | 'delete' | 'reposition';
  listNode: ListNode;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list-item-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="createChildNode()" style="display: flex">
      <dasch-swiss-multi-language-input
        style="flex: 1"
        [formGroup]="form"
        controlName="labels"
        [placeholder]="placeholder">
      </dasch-swiss-multi-language-input>
      <button color="primary" mat-icon-button matSuffix [disabled]="form.invalid" type="submit">
        <mat-icon> add</mat-icon>
      </button>
    </form>
  `,
})
export class ListItemFormComponent implements OnInit {
  @Input() projectUuid?: string;
  @Input() projectIri?: string;
  @Input() parentIri: string;

  loading = false;
  placeholder = 'Append item to ';
  form: FormGroup;

  constructor(
    private _listApiService: ListApiService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._buildForms();

    this._listApiService.getNodeInfo(this.parentIri).subscribe(response => {
      if (response['listinfo']) {
        // root node
        this.placeholder += (response as ListInfoResponse).listinfo.labels[0].value;
      } else {
        // child node
        this.placeholder += (response as ListNodeInfoResponse).nodeinfo.labels[0].value;
      }

      this._cd.markForCheck();
    });
  }

  private _buildForms() {
    this.form = this._fb.group({
      labels: this._fb.array(
        [{ language: 'de', value: '' }].map(({ language, value }) =>
          this._fb.group({
            language,
            value: [value, [Validators.maxLength(2000)]],
          })
        ),
        atLeastOneStringRequired('value')
      ),
    });
  }

  /**
   * called from the template when the plus button is clicked.
   * Sends the info to make a new child node to DSP-API and refreshes the UI to show the newly added node at the end of the list.
   */
  createChildNode() {
    console.log('submit', this);
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
    for (const l of this.form.value.labels) {
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
      this.loading = false;
    });
  }

  /**
   * show action bubble with various CRUD buttons when hovered over.
   */
}
