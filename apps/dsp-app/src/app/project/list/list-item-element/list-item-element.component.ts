import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ListNode } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-list-item-element',
  template: `
    <div style="display: flex">
      <button type="button" color="primary" mat-icon-button (click)="showChildren = !showChildren">
        <mat-icon>{{ showChildren ? 'expand_more' : 'chevron_right' }} </mat-icon>
      </button>

      <div style="flex: 1">
        <div (mouseenter)="mouseEnter()" (mouseleave)="mouseLeave()" style="position: relative">
          <dasch-swiss-multi-language-input
            [placeholder]="node.labels | appStringifyStringLiteral: 'all' | appTruncate: 128"
            [editable]="false"
            [formGroup]="readOnlyForm"
            controlName="labels">
          </dasch-swiss-multi-language-input>

          <app-action-bubble
            [position]="position"
            [length]="length"
            [labels]="node.labels"
            [parentIri]="parentIri"
            [iri]="node.id"></app-action-bubble>
        </div>

        <app-list-item
          *ngIf="showChildren"
          [language]="language"
          [childNode]="true"
          [list]="node.children"
          [parentIri]="node.id"
          [isAdmin]="isAdmin"
          [projectIri]="projectIri"
          [projectUuid]="projectUuid"
          [projectStatus]="projectStatus">
        </app-list-item>
      </div>
    </div>
  `,
  styles: [':host ::ng-deep dasch-swiss-multi-language-input .mat-mdc-form-field-bottom-align { display: none;}'],
})
export class ListItemElementComponent implements OnInit {
  @Input() parentIri?: string;

  @Input() projectUuid: string;

  @Input() projectStatus: boolean;

  @Input() projectIri: string;

  @Input() childNode: boolean;

  @Input() language?: string;

  @Input() node: ListNode;
  @Input() position: number;
  @Input() length: number;
  @Input() last: boolean;

  @Output() refreshChildren = new EventEmitter<ListNode[]>();
  @Output() updateView = new EventEmitter<unknown>();

  @Input() isAdmin = false;
  showChildren = false;
  showActionBubble = false;

  readOnlyForm: FormGroup;

  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
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
