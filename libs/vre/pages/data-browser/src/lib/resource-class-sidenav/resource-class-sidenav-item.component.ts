import { ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants, KnoraApiConnection, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { LocalizationService, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, finalize, first, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { AbTestService } from './ab-test.service';

@Component({
  selector: 'app-resource-class-sidenav-item',
  template: `
    {{ ontologiesLabel }}
    <div
      style="flex-grow: 0; flex-basis: 150px;
    justify-content: end;
    margin-right: 0;">
      <span>{{ count$ | async }}</span>
      <mat-icon style="margin-left: 8px; color: #d7d7d7">{{ icon }}</mat-icon>
    </div>
  `,
  standalone: false,
})
export class ResourceClassSidenavItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) resClass!: ResourceClassDefinitionWithAllLanguages;

  private _reloadSubject = new BehaviorSubject<null>(null);
  destroyed = new Subject<void>();
  hasProjectMemberRights$ = this._projectPageService.hasProjectMemberRights$;
  icon!: string;
  ontologiesLabel!: string;
  ontologiesDescription!: string;
  count$!: Observable<number>;
  loading = true;
  isHovered = false;

  ontologyLabel!: string;
  classLabel!: string;

  constructor(
    private _cd: ChangeDetectorRef,
    private _localizationService: LocalizationService,
    private _translateService: TranslateService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _projectPageService: ProjectPageService,
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef,
    public _abTestService: AbTestService
  ) {}

  selectResourceClass() {
    this._abTestService.resourceClasSelected = null;

    setTimeout(() => {
      this._abTestService.resourceClasSelected = {
        classLabel: this.classLabel,
        ontologyLabel: this.ontologyLabel,
        resClass: this.resClass,
      };
    }, 0);
  }

  ngOnInit(): void {
    this.icon = this._getIcon();

    this._translateService.onLangChange.pipe(startWith(null), takeUntil(this.destroyed)).subscribe(() => {
      this.getOntologiesLabelsInPreferredLanguage();
      this.getOntologiesDescriptionInPreferredLanguage();
    });

    this._projectPageService.currentProjectUuid$.pipe(first()).subscribe(projectUuid => {
      const [ontologyIri, className] = this.resClass.id.split('#');
      const ontologyName = OntologyService.getOntologyNameFromIri(ontologyIri);

      this.ontologyLabel = ontologyName;
      this.classLabel = className;
    });

    this._loadData();
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private _loadData() {
    this.count$ = this._getCount(this.resClass.id).pipe(
      finalize(() => {
        this.loading = false;
      })
    );
  }

  private getOntologiesLabelsInPreferredLanguage(): void {
    if (this.resClass.labels) {
      const label = this.resClass.labels.find(l => l.language === this._localizationService.getCurrentLanguage());
      this.ontologiesLabel = label ? label.value : this.resClass.labels[0].value;
      this._cd.markForCheck();
    }
  }

  private getOntologiesDescriptionInPreferredLanguage(): void {
    if (this.resClass.comments) {
      const description = this.resClass.comments.find(
        l => l.language === this._localizationService.getCurrentLanguage()
      );
      this.ontologiesDescription = description ? description.value : this.resClass.comments[0].value;
      this._cd.markForCheck();
    }
  }

  private _getIcon(): string {
    switch (this.resClass.subClassOf[0]) {
      case Constants.AudioRepresentation:
        return 'audio_file';
      case Constants.ArchiveRepresentation:
        return 'folder_zip';
      case Constants.DocumentRepresentation:
        return 'description';
      case Constants.MovingImageRepresentation:
        return 'video_file';
      case Constants.StillImageRepresentation:
        return 'image';
      case Constants.TextRepresentation:
        return 'text_snippet';
      default: // resource does not have a file representation
        return 'insert_drive_file';
    }
  }

  private _getCount(resClassId: string) {
    const gravsearch = this._getGravsearch(resClassId);

    return this._dspApiConnection.v2.search
      .doExtendedSearchCountQuery(gravsearch)
      .pipe(map(response => response.numberOfResults));
  }

  private _getGravsearch(iri: string): string {
    return `
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
        CONSTRUCT {

        ?mainRes knora-api:isMainResource true .

        } WHERE {

        ?mainRes a knora-api:Resource .

        ?mainRes a <${iri}> .

        }

        OFFSET 0`;
  }
}
