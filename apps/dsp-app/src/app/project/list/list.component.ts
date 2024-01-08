import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo, StringLiteral } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { AppConfigService, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import {
  DeleteListNodeAction,
  ListsSelectors,
  LoadListsInProjectAction,
  ProjectsSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { AppGlobal } from '../../app-global';
import { ConfirmDialogComponent } from '../../main/action/confirm-dialog/confirm-dialog.component';
import { ProjectBase } from '../project-base';
import { EditListInfoDialogComponent } from './reusable-list-info-form/edit-list-info-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent extends ProjectBase implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  languagesList: StringLiteral[] = AppGlobal.languagesList;

  // current selected language
  language: string;

  // selected list iri
  listIri: string = undefined;

  openPanel: number;

  // i18n plural mapping
  itemPluralMapping = {
    list: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 list',
      other: '# lists',
    },
  };

  // disable content on small devices
  disableContent = false;

  list$ = this._listApiService.listInProject('http://rdfh.ch/projects/00FF').pipe(
    tap(v => console.log('data received list.component', v)),
    map(lists => (this.listIri ? lists.lists.find(i => i.id === this.listIri) : null)),
    tap(v => console.log('list.component', v))
  );
  z$ = this.list$.pipe(
    switchMap(v => this._listApiService.get(v.id)),
    tap(v => console.log('list / get', v))
  );

  @Select(ListsSelectors.isListsLoading) isListsLoading$: Observable<boolean>;

  constructor(
    private _acs: AppConfigService,
    private _dialog: MatDialog,
    protected _route: ActivatedRoute,
    protected _router: Router,
    protected _titleService: Title,
    protected _projectService: ProjectService,
    protected _store: Store,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions,
    private _listApiService: ListApiService
  ) {
    super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
  }

  @HostListener('window:resize', ['$event']) onWindowResize() {
    this.disableContent = window.innerWidth <= 768;
    // reset the page title
    if (!this.disableContent) {
      this._setPageTitle();
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this.disableContent = window.innerWidth <= 768;

    // set the page title
    this._setPageTitle();

    // get list iri from list name
    this._route.params.subscribe(params => {
      if (this.project) {
        this.listIri = `${this._acs.dspAppConfig.iriBase}/lists/${this.project.shortcode}/${params['list']}`;
      }
    });
    this.z$.subscribe();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * open dialog in every case of modification:
   * edit list data, remove list from project etc.
   *
   */
  editList(list: ListNodeInfo) {
    this._dialog.open(EditListInfoDialogComponent, {
      width: '100%',
      minWidth: 500,
      data: {
        projectIri: this._projectService.uuidToIri(this.projectUuid),
        list,
      },
    });
  }

  openDialog(list: ListNodeInfo): void {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: {
          message: 'Do you want to delete this controlled vocabulary?',
        },
      })
      .afterClosed()
      .subscribe(response => {
        if (!response) return;
        this._store.dispatch(new DeleteListNodeAction(this.listIri));
        this.listIri = undefined;
        this._actions$
          .pipe(ofActionSuccessful(DeleteListNodeAction))
          .pipe(take(1))
          .subscribe(() => {
            this._store.dispatch(new LoadListsInProjectAction(this.projectIri));
            this._router.navigate([RouteConstants.project, this.projectUuid, RouteConstants.dataModels]);
          });
      });
  }

  private _setPageTitle() {
    const project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
    this._titleService.setTitle(`Project ${project?.shortname} | List${this.listIri ? '' : 's'}`);
  }
}
