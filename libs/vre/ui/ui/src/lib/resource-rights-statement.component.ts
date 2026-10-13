import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { joinPlaceholderLegalValues } from '@dasch-swiss/vre/shared/app-common';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Canonical display of a resource's data-side legal information
 * (license, copyright holder, authorship) — the "Resource Rights Statement".
 *
 * Used on the resource viewer, the create-resource form (preview) and the project description.
 *
 * Behaviour (per spec §1b):
 * - Renders as soon as any field is set (license, copyright holder, or — in a per-resource context —
 *   authorship). When NOTHING is set: renders the admins-only "uncategorized — please review" callout
 *   for admins, and renders nothing for everyone else (including logged-out visitors).
 * - When configured: shows whichever of the license (linked to its Creative Commons deed) and the
 *   copyright holder are set — each independently — and, unless `showAuthorship` is false, the
 *   authorship. Project-level displays pass `showAuthorship=false`, since authorship is per-resource.
 * - In a per-resource context, when the resource has no own authorship, shows a labeled fallback
 *   ("No authorship recorded for this resource. Project default: …") rather than asserting the default.
 * - For users with edit rights (`canEditAuthorship`), the authorship row behaves like a property
 *   value: marked on hover with an Edit button at the end of its line, and edited in place (a chip
 *   editor with Cancel and Save where Edit was) — no dialog — emitting the new list via
 *   `saveAuthorship`.
 */
@Component({
  selector: 'app-resource-rights-statement',
  template: `
    @if (configured) {
      <section class="rights-statement" [class.label-start]="labelAlign === 'start'">
        <h3 class="mat-subtitle-2">{{ 'legal.dataSide.heading' | translate }}</h3>

        @if (licenseLabel || isPlaceholderLicense) {
          <div class="row">
            <span class="label mat-subtitle-2">{{ 'legal.dataSide.license' | translate }}</span>
            <span class="value">
              @if (isPlaceholderLicense) {
                <!-- The sentinel's own label is a 96-character sentence and its uri is not
                     dereferenceable, so show the readable marker as plain text. See DEV-6994. -->
                {{ 'legal.dataSide.placeholder' | translate }}
              } @else if (licenseUrl) {
                <a
                  [href]="licenseUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  [attr.aria-label]="licenseLabel + ', ' + ('legal.dataSide.opensInNewTab' | translate)">
                  {{ licenseLabel }}
                </a>
              } @else {
                {{ licenseLabel }}
              }
            </span>
          </div>
        }

        @if (copyrightHolder) {
          <div class="row">
            <span class="label mat-subtitle-2">{{ 'legal.dataSide.copyrightHolder' | translate }}</span>
            <span class="value">
              @if (isPlaceholderCopyrightHolder) {
                {{ 'legal.dataSide.placeholder' | translate }}
              } @else {
                {{ copyrightHolder }}
              }
            </span>
          </div>
        }

        @if (showAuthorship) {
          <div class="row">
            <span class="label mat-subtitle-2">{{ 'legal.dataSide.authorship' | translate }}</span>
            @if (editing) {
              <!-- In place, like a property value being edited: the editor, then Cancel and Save at
                   the end of the same line, where Edit was (DEV-7494). -->
              <div class="value value-line edit-line">
                <mat-form-field class="authorship-edit-field" subscriptSizing="dynamic">
                  <mat-chip-grid #chipGrid [attr.aria-label]="'legal.dataSide.authorship' | translate">
                    @for (author of editAuthorshipList; track $index) {
                      <mat-chip-row (removed)="removeEditAuthor($index)">
                        {{ author }}
                        <button
                          type="button"
                          matChipRemove
                          [attr.aria-label]="'legal.dataSide.removeAuthor' | translate: { name: author }">
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </mat-chip-row>
                    }
                    <input
                      #chipInput
                      autocomplete="off"
                      [matChipInputFor]="chipGrid"
                      [matChipInputAddOnBlur]="true"
                      (matChipInputTokenEnd)="addEditAuthor($event)" />
                  </mat-chip-grid>
                  <mat-hint>{{ 'legal.dataSide.authorshipHint' | translate }}</mat-hint>
                </mat-form-field>
                <div class="value-actions edit-actions">
                  <button
                    mat-icon-button
                    type="button"
                    class="value-action muted"
                    data-cy="authorship-cancel"
                    [matTooltip]="'legal.dataSide.settings.cancel' | translate"
                    [attr.aria-label]="'legal.dataSide.settings.cancel' | translate"
                    (click)="cancelEdit()">
                    <mat-icon>close</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    type="button"
                    class="value-action"
                    data-cy="authorship-save"
                    [matTooltip]="'legal.dataSide.settings.save' | translate"
                    [attr.aria-label]="'legal.dataSide.settings.save' | translate"
                    (click)="saveEdit()">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                </div>
              </div>
            } @else {
              <!-- Like a property value: marked on hover, with Edit at the end of its line. Shown on
                   keyboard focus too, so the button stays reachable without a pointer (DEV-7494). -->
              <div class="value value-line" [class.editable]="canEditAuthorship" data-cy="authorship-value">
                <span class="value-text">
                  @if (resourceAuthorship && !resourceAuthorship.length) {
                    @if (defaultResourceAuthorship.length) {
                      <em>{{
                        'legal.dataSide.noAuthorshipFallback'
                          | translate
                            : {
                                default: authorshipWith(
                                  defaultResourceAuthorship,
                                  'legal.dataSide.placeholder' | translate
                                ),
                              }
                      }}</em>
                    } @else {
                      <em>{{ 'legal.dataSide.noAuthorshipFallbackNoDefault' | translate }}</em>
                    }
                  } @else if (resourceAuthorship) {
                    {{ authorshipWith(resourceAuthorship, 'legal.dataSide.placeholder' | translate) }}
                  } @else if (defaultResourceAuthorship.length) {
                    {{ authorshipWith(defaultResourceAuthorship, 'legal.dataSide.placeholder' | translate) }}
                  } @else {
                    <em>{{ 'legal.dataSide.noAuthorshipFallbackNoDefault' | translate }}</em>
                  }
                </span>
                @if (canEditAuthorship) {
                  <div class="value-actions">
                    <button
                      #editButton
                      mat-icon-button
                      type="button"
                      class="value-action edit-authorship"
                      data-cy="authorship-edit"
                      [matTooltip]="'legal.dataSide.edit' | translate"
                      [attr.aria-label]="'legal.dataSide.edit' | translate"
                      (click)="startEdit()">
                      <mat-icon>edit</mat-icon>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </section>
    } @else if (isAdmin) {
      <section class="rights-statement uncategorized" role="status">
        <mat-icon aria-hidden="true" color="warn">warning</mat-icon>
        <span>{{ 'legal.dataSide.uncategorized' | translate }}</span>
        <button type="button" mat-button color="primary" (click)="editLegalInfo.emit()">
          {{ 'legal.dataSide.editLegalInfo' | translate }}
        </button>
      </section>
    }
  `,
  styles: [
    `
      .rights-statement {
        margin: 16px 0;
      }
      /* Mirror the property value rows (property-row.component) so the rights statement
         reads as one block with the properties above it — same label typography, column
         width and value offset. */
      .row {
        display: flex;
        align-items: baseline;
      }
      .label {
        color: rgb(107, 114, 128);
        /* rem so the column scales with user font-size settings (WCAG 1.4.4, 1.4.10). */
        width: 9.375rem;
        text-align: right;
        padding: 6px 16px;
        line-height: normal;
        flex-shrink: 0;
        overflow-wrap: break-word;
      }
      .value {
        flex: 1;
        padding: 6px 8px;
      }
      .value.value-line {
        padding: 0 0 0 8px;
      }
      /* Project-level (card) variant: left-align the labels, drop the left padding so they line up
         flush with the heading, and use a tighter label column. */
      .label-start .label {
        text-align: left;
        padding-left: 0;
        width: 8.125rem;
      }
      /* The authorship line, styled as a property value's (property-value-display and
         property-value-actions in the resource editor, which this library cannot import):
         marked on hover, with its actions at the end of the line (DEV-7494). */
      .value-line {
        display: flex;
        align-items: flex-start;
        gap: 4px;
        border-radius: 4px;
        padding: 0 0 0 8px;
      }
      .value-line.editable:hover,
      .value-line.editable:focus-within {
        background: rgba(51, 103, 144, 0.06);
      }
      .value-text {
        flex: 1;
        min-width: 0;
        padding: 6px 0;
        overflow-wrap: anywhere;
      }
      .value-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        flex: none;
        padding-right: 4px;
      }
      /* Hidden, not removed, until the line is hovered or focused: a removed button could not be
         reached from the keyboard, nor take focus back after the editor closes (WCAG 2.4.3). */
      .value-line:not(.edit-line) .value-actions {
        opacity: 0;
      }
      .value-line:hover .value-actions,
      .value-line:focus-within .value-actions {
        opacity: 1;
      }
      .value-action {
        --mat-icon-button-state-layer-size: 28px;
        flex: none;
        width: 28px;
        height: 28px;
        padding: 0;
        color: var(--primary, #336790);
      }
      .value-action.muted {
        color: rgba(0, 0, 0, 0.6);
      }
      .value-action mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
      }
      .value.value-line.edit-line {
        padding: 4px 0 4px 8px;
        background: var(--property-value-edit-background, none);
      }
      .authorship-edit-field {
        flex: 1;
        min-width: 0;
      }
      .edit-actions {
        padding-top: 14px;
      }
      .uncategorized {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border: 1px solid;
        border-radius: 4px;
      }
    `,
  ],
  imports: [MatButtonModule, MatChipsModule, MatFormFieldModule, MatIconModule, MatTooltipModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceRightsStatementComponent {
  /** The human-readable license label, e.g. "CC BY 4.0". Rendered only when set (see `configured`). */
  @Input() licenseLabel?: string;
  /** The license deed URL (Creative Commons), rendered as a link. */
  @Input() licenseUrl?: string;
  /** The project-wide copyright holder. */
  @Input() copyrightHolder?: string;
  /** The project default authorship. */
  @Input() defaultResourceAuthorship: string[] = [];
  /** The per-resource authorship (only in a per-resource context); empty/absent ⇒ labeled fallback. */
  @Input() resourceAuthorship: string[] | null = null;
  /** Whether the current user is a project/system admin (controls the unconfigured callout). */
  @Input() isAdmin = false;
  /** Whether the current user may edit the per-resource authorship (Modify rights). */
  @Input() canEditAuthorship = false;
  /** Label alignment: 'end' (right — matches property rows in the viewer) or 'start' (left — for the project card). */
  @Input() labelAlign: 'start' | 'end' = 'end';
  /** Whether to render the authorship row. Authorship is per-resource; project-level displays pass `false`. */
  @Input() showAuthorship = true;
  /** True when the project's license is the placeholder sentinel; renders the marker instead of a link. */
  @Input() isPlaceholderLicense = false;
  /** True when `copyrightHolder` is the placeholder sentinel; renders the marker instead of the URN. */
  @Input() isPlaceholderCopyrightHolder = false;

  /** Emitted when an admin clicks "Edit legal info" on the unconfigured callout (routes to Settings → Legal). */
  @Output() editLegalInfo = new EventEmitter<void>();
  /** Emitted with the new authorship list when a Modify user saves the inline editor. */
  @Output() saveAuthorship = new EventEmitter<string[]>();

  /** Whether the inline authorship editor is open. */
  editing = false;
  /** Working copy of the authorship list while editing (committed only on save). */
  editAuthorshipList: string[] = [];

  @ViewChild('chipInput') private _chipInput?: ElementRef<HTMLInputElement>;
  @ViewChild('editButton') private _editButton?: ElementRef<HTMLButtonElement>;

  get configured(): boolean {
    return !!this.licenseLabel || this.isPlaceholderLicense || !!this.copyrightHolder || this._hasDisplayableAuthorship;
  }

  /**
   * Joins authorship entries, substituting `placeholderLabel` for any placeholder sentinel. The label
   * arrives already translated from the `| translate` pipe in the template, so this component needs no
   * `TranslateService`. See DEV-6994.
   */
  authorshipWith(values: string[], placeholderLabel: string): string {
    return joinPlaceholderLegalValues(values, placeholderLabel);
  }

  /** Per-resource authorship worth showing: only in an authorship context (`showAuthorship`), and
   *  only when there are actual authors (own or project default). Lets a resource that has only
   *  authorship set still render the statement. */
  private get _hasDisplayableAuthorship(): boolean {
    return (
      this.showAuthorship && ((this.resourceAuthorship?.length ?? 0) > 0 || this.defaultResourceAuthorship.length > 0)
    );
  }

  /** Open the inline editor, seeded with the currently displayed authorship. */
  startEdit(): void {
    const valueToEdit = this.resourceAuthorship?.length ? this.resourceAuthorship : this.defaultResourceAuthorship;
    this.editAuthorshipList = [...valueToEdit];
    this.editing = true;
    // Move focus into the chip input once Angular has rendered the editor branch (WCAG 2.4.3).
    queueMicrotask(() => this._chipInput?.nativeElement.focus());
  }

  addEditAuthor(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.editAuthorshipList = [...this.editAuthorshipList, value];
    }
    event.chipInput?.clear();
  }

  removeEditAuthor(index: number): void {
    this.editAuthorshipList = this.editAuthorshipList.filter((_, i) => i !== index);
  }

  /** Discard edits and close the editor. */
  cancelEdit(): void {
    this.editing = false;
    this._restoreFocusToEditButton();
  }

  /** Commit the edited list to the parent and close the editor. */
  saveEdit(): void {
    this.saveAuthorship.emit([...this.editAuthorshipList]);
    this.editing = false;
    this._restoreFocusToEditButton();
  }

  private _restoreFocusToEditButton(): void {
    // Restore focus once Angular has rendered the read-only branch (WCAG 2.4.3).
    queueMicrotask(() => this._editButton?.nativeElement.focus());
  }
}
