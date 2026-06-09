import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import type { StringLiteralV2 } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslatePipe } from '@ngx-translate/core';
import type { PropertyInfo } from '../ontology.types';

/**
 * Single row in the property library list.
 *
 * Renders the property's icon (from its `propType.icon`), localized label,
 * type group chip, and a drag handle (`cdkDragHandle`). Drag is the only
 * affordance — assignment happens by dropping onto a class card in the
 * center pane.
 *
 * Drag start / end signalling is the parent's responsibility — the row
 * forwards `cdkDragStarted` / `cdkDragEnded` via two outputs so the parent
 * can flip `OntologyEditorViewService.isPropertyDragging$`. The row itself
 * stays template-only.
 *
 * The drag handle is hidden when `editingEnabled` is `false`.
 */
@Component({
  selector: 'app-property-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDrag, CdkDragHandle, MatIcon, MatIconButton, MatTooltip, TranslatePipe],
  templateUrl: './property-row.component.html',
  styleUrls: ['./property-row.component.scss'],
})
export class PropertyRowComponent {
  @Input({ required: true }) property!: PropertyInfo;
  @Input() editingEnabled = true;

  @Output() readonly dragStarted = new EventEmitter<void>();
  @Output() readonly dragEnded = new EventEmitter<void>();

  private readonly _localization = inject(LocalizationService);

  get label(): string {
    return this._resolveLabel(this.property.propDef.labels, this.property.propDef.label || this.property.propDef.id);
  }

  get icon(): string {
    return this.property.propType?.icon || 'data_object';
  }

  get group(): string {
    return this.property.propType?.group || '';
  }

  onDragStarted(): void {
    // eslint-disable-next-line no-console
    console.debug('[dnd] property-row dragStarted', { property: this.property.propDef.id });
    this.dragStarted.emit();
  }

  onDragEnded(): void {
    // eslint-disable-next-line no-console
    console.debug('[dnd] property-row dragEnded', { property: this.property.propDef.id });
    this.dragEnded.emit();
  }

  private _resolveLabel(labels: StringLiteralV2[] | undefined, fallback: string): string {
    if (!labels || labels.length === 0) return fallback;
    const lang = this._localization.getCurrentLanguage();
    return (
      labels.find(l => 'language' in l && l.language === lang)?.value ??
      labels.find(l => !('language' in l) || !l.language)?.value ??
      labels[0]?.value ??
      fallback
    );
  }
}
