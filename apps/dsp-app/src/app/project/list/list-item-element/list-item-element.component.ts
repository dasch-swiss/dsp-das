import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListNode } from '@dasch-swiss/dsp-js';
import { MultiLanguageFormArray } from '../../../../../../../libs/vre/shared/app-string-literal/src/lib/multi-language-form.service';
import { ListItemService } from '../list-item/list-item.service';

@Component({
  selector: 'app-list-item-element',
  template: `
    <div style="display: flex">
      <button type="button" color="primary" mat-icon-button (click)="showChildren = !showChildren">
        <mat-icon>{{ showChildren ? 'expand_more' : 'chevron_right' }}</mat-icon>
      </button>

      <div style="flex: 1">
        <div (mouseenter)="mouseEnter()" (mouseleave)="mouseLeave()" style="position: relative">
          <dasch-swiss-multi-language-input
            [placeholder]="node.labels | appStringifyStringLiteral: 'all' | appTruncate: 128"
            [editable]="false"
            [formArray]="labelsControl"
            [validators]="[]">
          </dasch-swiss-multi-language-input>

          <app-action-bubble
            *ngIf="showActionBubble"
            [position]="position"
            [length]="length"
            [node]="node"></app-action-bubble>
        </div>

        <app-list-item
          *ngIf="showChildren"
          [projectUuid]="listItemService.projectInfos.projectIri"
          [rootNodeIri]="node.id"
          [isAdmin]="isAdmin">
        </app-list-item>
      </div>
    </div>
  `,
  styles: [':host ::ng-deep dasch-swiss-multi-language-input .mat-mdc-form-field-bottom-align { display: none;}'],
})
export class ListItemElementComponent implements OnInit, OnChanges {
  @Input() node: ListNode;
  @Input() position: number;
  @Input() length: number;

  @Output() refreshChildren = new EventEmitter<ListNode[]>();
  @Output() updateView = new EventEmitter<unknown>();

  @Input() isAdmin = false;
  showChildren = false;
  showActionBubble = false;

  readOnlyForm: FormGroup;

  // TODO remove with typed forms
  get labelsControl() {
    return this.readOnlyForm.get('labels') as MultiLanguageFormArray;
  }

  constructor(
    private _fb: FormBuilder,
    public listItemService: ListItemService
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  ngOnChanges() {
    this.buildForm();
  }

  private buildForm() {
    this.readOnlyForm = this._fb.group({
      labels: this._fb.array(
        this.node.labels.map(({ language, value }) =>
          this._fb.group({
            language,
            value,
          })
        )
      ),
    });
  }

  mouseEnter() {
    if (this.isAdmin) {
      this.showActionBubble = true;
    }
  }

  mouseLeave() {
    this.showActionBubble = false;
  }
}
