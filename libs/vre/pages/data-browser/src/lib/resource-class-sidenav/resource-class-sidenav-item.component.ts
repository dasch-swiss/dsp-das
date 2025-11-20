import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { LocalizationService, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, filter, first, map, of, startWith, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-resource-class-sidenav-item',
  template: `
    <div (click)="selectResourceClass()" class="item" [ngClass]="{ selected: isSelected$ | async }">
      <span style="flex: 1">
        {{ label }}
      </span>
      <div
        style="
    justify-content: end;
    display: flex;
    align-items: center;
    color: #b9b9b9;
    margin-right: 0;">
        <span>{{ count }}</span>
        <mat-icon style="margin-left: 8px">{{ icon }}</mat-icon>
      </div>
    </div>
  `,
  styles: [
    `
      .item {
        display: flex;
        align-items: center;
        padding: 8px 16px;
        cursor: pointer;

        &:hover {
          background-color: #ebebeb;
        }
        &.selected {
          border-left: 2px solid #33678f;
          background-color: #d6e0e8;
        }
      }
    `,
  ],
  standalone: false,
})
export class ResourceClassSidenavItemComponent implements OnInit, OnDestroy {
  @Input({ required: true }) iri!: string;
  @Input({ required: true }) count!: number;
  @Input({ required: true }) label!: string;

  get icon(): string {
    return 'audio_file';
    /*
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
     */
  }

  destroyed = new Subject<void>();
  loading = true;

  ontologyLabel!: string;
  classLabel!: string;

  isSelected$ = this._router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    switchMap(() => {
      const firstChild = this._route.firstChild;
      if (!firstChild) {
        return of(false);
      }
      return combineLatest([firstChild.params, this._projectPageService.currentProject$.pipe(first())]).pipe(
        map(([params, project]) => {
          const selectedResClassId = this._ontologyService.getClassIdFromParams(
            project.shortcode,
            params[RouteConstants.ontologyParameter],
            params[RouteConstants.classParameter]
          );
          return this.iri === selectedResClassId;
        })
      );
    })
  );

  constructor(
    private _cd: ChangeDetectorRef,
    private _ontologyService: OntologyService,
    private _localizationService: LocalizationService,
    private _translateService: TranslateService,
    private _projectPageService: ProjectPageService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  selectResourceClass() {
    this._router.navigate([this.ontologyLabel, this.classLabel], { relativeTo: this._route });
  }

  ngOnInit(): void {
    /*
    this._translateService.onLangChange.pipe(startWith(null), takeUntil(this.destroyed)).subscribe(() => {
      this.getOntologiesLabelsInPreferredLanguage();
      this.getOntologiesDescriptionInPreferredLanguage();
    });
*/
    const [ontologyIri, className] = this.iri.split('#');
    const ontologyName = OntologyService.getOntologyNameFromIri(ontologyIri);

    this.ontologyLabel = ontologyName;
    this.classLabel = className;
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /*
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
      this.ontologiesDescription = description ? description.value : this.resClass.comments[0]?.value;
      this._cd.detectChanges();
    }
  }
  */
}
