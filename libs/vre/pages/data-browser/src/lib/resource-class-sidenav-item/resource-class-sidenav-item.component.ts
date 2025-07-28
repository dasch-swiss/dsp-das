import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors } from '@dasch-swiss/vre/core/state';
import { LocalizationService, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { finalize, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ResourceClassSidenavItemService } from './resource-class-sidenav-item.service';

@Component({
  selector: 'app-resource-class-sidenav-item',
  template: `
    <div class="class-item-container">
      <div class="content" data-cy="class-item" [routerLinkActive]="['is-active']">
        <div class="box link" [routerLink]="classLink">
          <div class="label">{{ ontologiesLabel }}</div>
          <div class="entry-container">
            <mat-icon>{{ icon }}</mat-icon>
            <ngx-skeleton-loader
              *ngIf="loading"
              count="1"
              appearance="line"
              [theme]="{
                'margin-bottom': 0,
                'vertical-align': 'middle',
              }" />
            <div class="entry">
              {{ count$ | async | i18nPlural: itemPluralMapping['entry'] }}
            </div>
          </div>
        </div>
        <a class="icon link" data-cy="add-class-instance" *ngIf="isMember$ | async" (click)="goToAddClassInstance()">
          <mat-icon>add_circle_outline</mat-icon>
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./resource-class-sidenav-item.component.scss'],
  providers: [ResourceClassSidenavItemService],
})
export class ResourceClassSidenavItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) resClass!: ResourceClassDefinitionWithAllLanguages;

  destroyed = new Subject<void>();
  isMember$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminSysAdminOrMember);
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
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _translateService: TranslateService,
    private _resourceClassSidenavItemService: ResourceClassSidenavItemService
  ) {}

  ngOnInit(): void {
    const projectUuid = this._route.snapshot.paramMap.get(RouteConstants.uuidParameter);
    const [ontologyIri, className] = this.resClass.id.split('#');
    const ontologyName = OntologyService.getOntologyName(ontologyIri);

    this.classLink = `${RouteConstants.projectRelative}/${projectUuid}/${RouteConstants.ontology}/${ontologyName}/${className}`;
    this.icon = this._getIcon();

    this._translateService.onLangChange.pipe(startWith(null), takeUntil(this.destroyed)).subscribe(() => {
      this.getOntologiesLabelsInPreferredLanguage();
    });

    this.count$ = this._resourceClassSidenavItemService.getCount(this.resClass.id).pipe(
      finalize(() => {
        this.loading = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
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

  goToAddClassInstance() {
    const link = `${this.classLink}/${RouteConstants.addClassInstance}`;
    this._router.navigate(['/']).then(() => this._router.navigate([link]));
  }
}
