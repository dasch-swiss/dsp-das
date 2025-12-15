import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Constants, ResourceClassDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ResourceClassCountApi } from '@dasch-swiss/vre/pages/data-browser';
import { LocalizationService, OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import {
  combineLatest,
  filter,
  finalize,
  first,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { DataBrowserPageService } from '../../data-browser-page.service';
import { ProjectPageService } from '../../project-page.service';

@Component({
  selector: 'app-resource-class-sidenav-item',
  template: `
    <div (click)="selectResourceClass()" class="item" [ngClass]="{ selected: isSelected$ | async }">
      <span style="flex: 1">
        {{ label | appStringifyStringLiteral }}
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
  imports: [AsyncPipe, NgClass, MatIcon],
})
export class ResourceClassSidenavItemComponent implements OnDestroy {
  @Input({ required: true }) iri!: string;
  @Input({ required: true }) count!: number;
  @Input({ required: true }) label!: LanguageStringDto[];

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
    private _ontologyService: OntologyService,
    private _projectPageService: ProjectPageService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  selectResourceClass() {
    const [ontologyIri, className] = this.iri.split('#');
    const ontologyName = OntologyService.getOntologyNameFromIri(ontologyIri);

    this._router.navigate([ontologyName, className], { relativeTo: this._route });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
