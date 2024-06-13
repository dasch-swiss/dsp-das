import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo, OntologyMetadata } from '@dasch-swiss/dsp-js';
import { AppConfigService, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { OntologyService, ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { ListsSelectors, OntologiesSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Actions, Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectBase } from '../project-base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-data-models',
  template: `
    <div *ngIf="(isLoading$ | async) === false" class="data-models-container" data-cy="data-models-container">
      <div class="header">
        <p class="title">All Data Models</p>
        <mat-icon
          color="primary"
          class="icon"
          matTooltip="A data model organizes data elements and specifies how they relate to one another and by which properties they are described."
          matTooltipPosition="above">
          info
        </mat-icon>
      </div>
      <div *ngIf="isAdmin$ | async" class="action-buttons">
        <a
          color="primary"
          data-cy="create-button"
          mat-raised-button
          class="create"
          [routerLink]="['..', RouteConstants.addOntology]">
          <mat-icon class="v-align-middle">add_circle</mat-icon>
          <span class="v-align-middle">Create New</span>
        </a>
        <a
          color="primary"
          mat-stroked-button
          class="docs"
          href="https://docs.dasch.swiss/latest/DSP-APP/user-guide/project/#data-model"
          target="_blank">
          Read Documentation About How To Create Data Models
          <mat-icon>chevron_right</mat-icon>
        </a>
      </div>
      <div *ngIf="ontologiesMetadata$ | async" class="projectOntos">
        <div class="list" [class.top-padding]="isAdmin$ | async">
          <div
            class="list-item ontos"
            *ngFor="let onto of ontologiesMetadata$ | async; trackBy: trackByOntologyMetaFn"
            data-cy="ontology-button"
            (click)="navigateToOntology(onto.id)">
            <mat-icon class="icon-prefix">bubble_chart</mat-icon>
            <p
              class="label"
              matTooltip="You must be logged in to view data models"
              matTooltipPosition="right"
              [matTooltipDisabled]="isLoggedIn$ | async">
              {{ onto.label }}
            </p>
            <span class="fill-remaining-space"></span>
            <mat-icon class="icon-suffix">chevron_right</mat-icon>
          </div>
        </div>
      </div>
      <div class="header">
        <p class="title">Controlled Vocabularies</p>
        <mat-icon
          color="primary"
          class="icon"
          matTooltip="Controlled vocabularies are hierarchical or non-hierarchical lexica of reference terms. Due to their normative or standardized nature, controlled vocabularies improve data quality and make database searching more efficient than free-text fields."
          matTooltipPosition="above">
          info
        </mat-icon>
      </div>
      <div *ngIf="isAdmin$ | async" class="action-buttons">
        <a color="primary" mat-raised-button class="create" [routerLink]="['..', RouteConstants.addList]">
          <mat-icon class="v-align-middle">add_circle</mat-icon>
          <span class="v-align-middle">Create New</span>
        </a>
      </div>
      <div *ngIf="(listsInProject$ | async)?.length > 0" class="projectLists">
        <div class="list" [class.top-padding]="isAdmin$ | async">
          <div
            class="list-item"
            *ngFor="let list of listsInProject$ | async; trackBy: trackByFn"
            (click)="navigateToList(list.id)">
            <mat-icon class="icon-prefix">list</mat-icon>
            <p
              class="label"
              matTooltip="You must be logged in to view data models"
              matTooltipPosition="right"
              [matTooltipDisabled]="isLoggedIn$ | async">
              {{ list.labels | appStringifyStringLiteral }}
            </p>
            <span class="fill-remaining-space"></span>
            <mat-icon class="icon-suffix">chevron_right</mat-icon>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @use '../../../styles/config' as *;

      .data-models-container {
        padding-top: 2.5%;
        padding-left: 2%;

        .header {
          .title,
          .icon {
            display: inline-flex;
            vertical-align: middle;
          }

          .icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
        }

        .action-buttons {
          .create {
            padding: 0% 7%;
            margin-right: 2%;

            mat-icon {
              font-size: 16px;
              width: 16px;
              height: 16px;
            }

            .v-align-middle {
              vertical-align: middle;
            }
          }
        }

        .list {
          padding-bottom: 4%;

          &.top-padding {
            padding-top: 4%;
          }

          .list-item {
            border: 1px solid $primary_100;
            border-bottom: none;
            cursor: pointer;
            padding-left: 2%;
            padding-right: 1%;
            display: grid;
            grid-template-columns: 24px auto 0.7fr 24px;
            align-items: center;

            &.no-click {
              cursor: default;
            }

            .label {
              margin-left: 1%;
            }
          }

          .list-item:last-child {
            border-bottom: 1px solid $primary_100;
          }
        }

        .icon-prefix,
        .icon-suffix {
          color: $primary;
        }
      }

      @media (max-width: 975px) {
        .data-models-container {
          .action-buttons {
            .docs {
              margin: 2% 0%;
            }
          }
        }
      }
    `,
  ],
})
export class DataModelsComponent extends ProjectBase implements OnInit {
  protected readonly RouteConstants = RouteConstants;
  get ontologiesMetadata$(): Observable<OntologyMetadata[]> {
    const uuid = this._route.parent.snapshot.params.uuid;
    const iri = `${this._appInit.dspAppConfig.iriBase}/projects/${uuid}`;
    if (!uuid) {
      return of({} as OntologyMetadata[]);
    }

    return this._store.select(OntologiesSelectors.projectOntologies).pipe(
      map(ontologies => {
        if (!ontologies || !ontologies[iri]) {
          return [];
        }

        return ontologies[iri].ontologiesMetadata;
      })
    );
  }

  @Select(UserSelectors.isLoggedIn) isLoggedIn$: Observable<boolean>;
  @Select(OntologiesSelectors.isLoading) isLoading$: Observable<boolean>;
  @Select(ListsSelectors.listsInProject) listsInProject$: Observable<ListNodeInfo[]>;

  constructor(
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _appInit: AppConfigService,
    protected _store: Store,
    protected _projectService: ProjectService,
    protected _titleService: Title,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions
  ) {
    super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  trackByFn = (index: number, item: ListNodeInfo) => `${index}-${item.id}`;

  trackByOntologyMetaFn = (index: number, item: OntologyMetadata) => `${index}-${item.id}`;

  navigateToList(id: string) {
    if (!this._store.selectSnapshot(UserSelectors.isLoggedIn)) {
      return;
    }

    const listName = id.split('/').pop();
    this._router.navigate([RouteConstants.list, encodeURIComponent(listName)], {
      relativeTo: this._route.parent,
    });
  }

  navigateToOntology(id: string) {
    if (!this._store.selectSnapshot(UserSelectors.isLoggedIn)) {
      return;
    }

    const ontoName = OntologyService.getOntologyName(id);
    this._router.navigate(
      [RouteConstants.ontology, encodeURIComponent(ontoName), RouteConstants.editor, RouteConstants.classes],
      {
        relativeTo: this._route.parent,
      }
    );
  }
}
