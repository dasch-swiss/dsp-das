import { ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Constants, KnoraApiConnection, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { LocalizationService, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { finalize, map, Observable, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-resource-class-sidenav-item',
  template: `
    <mat-accordion>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <!--<a [routerLinkActive]="['is-active']" [routerLink]="classLink" style="display: flex;"> </a>-->
          <mat-panel-title> {{ ontologiesLabel }}</mat-panel-title>
          <mat-panel-description>
            <span>{{ count$ | async | i18nPlural: itemPluralMapping['entry'] }}</span>
            @if (hasProjectMemberRights$ | async) {
              <span data-cy="add-class-instance" (click)="goToAddClassInstance()"> + </span>
            }
          </mat-panel-description>
        </mat-expansion-panel-header>
        <p>This is the primary content of the panel.</p>
      </mat-expansion-panel>
    </mat-accordion>
  `,
  styleUrls: ['./resource-class-sidenav-item.component.scss'],
})
export class ResourceClassSidenavItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) resClass!: ResourceClassDefinitionWithAllLanguages;

  destroyed = new Subject<void>();
  hasProjectMemberRights$ = this._projectPageService.hasProjectMemberRights$;
  classLink!: string;
  icon!: string;
  ontologiesLabel!: string;
  count$!: Observable<number>;
  loading = true;

  readonly itemPluralMapping = {
    entry: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 Entry',
      other: '# Entries',
    },
  };

  constructor(
    private _cd: ChangeDetectorRef,
    private _localizationService: LocalizationService,
    private _router: Router,
    private _translateService: TranslateService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _projectPageService: ProjectPageService
  ) {}

  ngOnInit(): void {
    this._projectPageService.currentProjectUuid$.subscribe(projectUuid => {
      const [ontologyIri, className] = this.resClass.id.split('#');
      const ontologyName = OntologyService.getOntologyNameFromIri(ontologyIri);

      this.classLink = `${RouteConstants.projectRelative}/${projectUuid}/${RouteConstants.ontology}/${ontologyName}/${className}`;
    });

    this.icon = this._getIcon();

    this._translateService.onLangChange.pipe(startWith(null), takeUntil(this.destroyed)).subscribe(() => {
      this.getOntologiesLabelsInPreferredLanguage();
    });

    this.count$ = this._getCount(this.resClass.id).pipe(
      finalize(() => {
        this.loading = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  goToAddClassInstance() {
    const link = `${this.classLink}/${RouteConstants.addClassInstance}`;
    this._router.navigate(['/']).then(() => this._router.navigate([link]));
  }

  private getOntologiesLabelsInPreferredLanguage(): void {
    if (this.resClass.labels) {
      const label = this.resClass.labels.find(l => l.language === this._localizationService.getCurrentLanguage());
      this.ontologiesLabel = label ? label.value : this.resClass.labels[0].value;
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
