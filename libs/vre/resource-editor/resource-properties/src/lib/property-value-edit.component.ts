import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Cardinality, ReadValue } from '@dasch-swiss/dsp-js';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { Subscription } from 'rxjs';
import { startWith, takeWhile } from 'rxjs/operators';
import { TemplateEditorSwitcherComponent } from 'template-switcher';
import { FormValueGroup } from './form-value-array.type';
import { PropertyValueBasicCommentComponent } from './property-value-basic-comment.component';
import { PropertyValueService } from './property-value.service';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-property-value-edit',
  template: `
    <app-template-editor-switcher
      [myPropertyDefinition]="propertyValueService.propertyDefinition"
      [resourceClassIri]="propertyValueService.editModeData.resource.type"
      [value]="readValue"
      (templateFound)="foundTemplate($event)" />

    @if (!loading) {
      <div style="display: flex; padding: 16px 0">
        <div style="flex: 1">
          @if (template) {
            <ng-container *ngTemplateOutlet="template; context: { item: group.controls.item }"></ng-container>
          }
          @if (group.controls.comment.value !== null) {
            <app-property-value-basic-comment [control]="group.controls.comment" />
          }
        </div>
        <div style="display: flex">
          <button (click)="afterUndo.emit()" mat-icon-button color="primary" [matTooltip]="'undo'">
            <mat-icon>undo</mat-icon>
          </button>
          <button
            mat-icon-button
            type="button"
            color="primary"
            (click)="toggleCommentValue()"
            data-cy="toggle-comment-button"
            [matTooltip]="commentIsNotNull ? 'remove comment' : 'add comment'">
            <mat-icon>{{ commentIsNotNull ? 'speaker_notes_off' : 'add_comment' }}</mat-icon>
          </button>
          @if (group.controls.item.value !== null) {
            <button (click)="onSave()" [matTooltip]="'save'" mat-icon-button data-cy="save-button" color="primary">
              <mat-icon>save</mat-icon>
            </button>
          }
        </div>
      </div>
    } @else {
      <app-progress-indicator [size]="'xsmall'" />
    }
  `,
  standalone: true,
  imports: [
    TemplateEditorSwitcherComponent,
    NgTemplateOutlet,
    PropertyValueBasicCommentComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AppProgressIndicatorComponent,
  ],
})
export class PropertyValueEditComponent implements OnInit, OnDestroy {
  @Input({ required: true }) readValue!: ReadValue | undefined;

  @Output() afterEdit = new EventEmitter<FormValueGroup>();
  @Output() afterUndo = new EventEmitter();
  template?: TemplateRef<any>;

  loading = false;
  private _subscription!: Subscription;

  group!: FormValueGroup;

  get commentIsNotNull() {
    return this.group.controls.comment.value !== null;
  }

  constructor(
    public propertyValueService: PropertyValueService,
    private _cd: ChangeDetectorRef
  ) {}

  protected readonly Cardinality = Cardinality;

  ngOnInit() {
    const propertyType = propertiesTypeMapping.get(this.propertyValueService.propertyDefinition.objectType!)!;
    this.group = new FormGroup({
      item: propertyType.control(this.readValue ?? propertyType.newValue),
      comment: new FormControl(this.readValue?.valueHasComment || null),
    });

    this._watchAndSetupCommentStatus();
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  foundTemplate(template: TemplateRef<any>) {
    this.template = template;
    this._cd.detectChanges();
  }

  onSave() {
    if (this.group.invalid) return;
    this.afterEdit.emit(this.group);
  }

  toggleCommentValue() {
    this.group.controls.comment.setValue(this.commentIsNotNull ? null : '');
  }

  private _watchAndSetupCommentStatus() {
    this._subscription = this.group.controls.item.statusChanges
      .pipe(
        startWith(null),
        takeWhile(() => this.group !== undefined)
      )
      .subscribe(status => {
        if (status === 'INVALID' || this.group.controls.item.value === null) {
          this.group.controls.comment.disable();
        } else if (status === 'VALID') {
          this.group.controls.comment.enable();
        }
      });
  }
}
