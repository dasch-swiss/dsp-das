import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadProject, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { DefaultProperty } from '@dasch-swiss/vre/shared/app-helper-services';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { EditPropertyFormDialogComponent } from '../../forms/property-form/edit-property-form-dialog.component';
import { EditPropertyDialogData } from '../../forms/property-form/property-form.type';
import { PropertyInfo, ClassShortInfo } from '../../ontology.types';
import { OntologyEditService } from '../../services/ontology-edit.service';

@Component({
  selector: 'app-property-info',
  templateUrl: './property-info.component.html',
  styleUrls: ['./property-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class PropertyInfoComponent {
  @Input({ required: true }) property!: PropertyInfo;

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  project!: ReadProject | undefined;

  showActionBubble = false;

  readonly canBeDeletedTrigger$ = new BehaviorSubject<void>(undefined);

  readonly canBeDeleted$ = this.canBeDeletedTrigger$.asObservable().pipe(
    switchMap(() => this._oes.canDeleteResourceProperty$(this.property.propDef!.id)),
    map(res => res.canDo),
    startWith(false)
  );

  isLockHovered = false;

  constructor(
    private _dialog: MatDialog,
    private _oes: OntologyEditService,
    private _dialogService: DialogService,
    private _store: Store
  ) {
    this.project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
  }

  openEditProperty(propDef: ResourcePropertyDefinitionWithAllLanguages, propType: DefaultProperty) {
    const propertyData: EditPropertyDialogData = {
      id: propDef.id,
      propType,
      name: propDef.id?.split('#').pop() || '',
      label: propDef.labels,
      comment: propDef.comments,
      guiElement: propDef.guiElement || propType.guiElement,
      guiAttribute: propDef.guiAttributes[0],
      objectType: propDef.objectType,
    };
    this._dialog.open<EditPropertyFormDialogComponent, EditPropertyDialogData>(
      EditPropertyFormDialogComponent,
      DspDialogConfig.dialogDrawerConfig(propertyData)
    );
  }

  openDeleteProperty(id: string) {
    this._dialogService
      .afterConfirmation('Do you want to delete this resource class ?')
      .pipe(switchMap(_del => this._oes.deleteProperty$(id)))
      .subscribe();
  }

  trackByFn = (index: number, item: ClassShortInfo) => item.id;

  mouseEnter() {
    if (this._oes.isTransacting) {
      return;
    }
    this.showActionBubble = true;
    this.canBeDeletedTrigger$.next();
  }

  mouseLeave() {
    this.showActionBubble = false;
  }
}
