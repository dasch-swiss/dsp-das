import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import { DeleteListNodeAction, ListsSelectors, LoadListsInProjectAction } from '@dasch-swiss/vre/core/state';
import { ProjectPageService } from '@dasch-swiss/vre/pages/project/project';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { combineLatest, map, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ListInfoFormComponent } from './list-info-form/list-info-form.component';
import { ListItemService } from './list-item/list-item.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  providers: [ListItemService],
})
export class ListPageComponent implements OnInit, OnDestroy {
  private readonly routeListIri$ = this._route.paramMap.pipe(
    take(1),
    map(params => params.get(RouteConstants.listParameter))
  );

  rootListNodeInfo$ = combineLatest([this._store.select(ListsSelectors.listsInProject), this.routeListIri$]).pipe(
    map(([lists, listIri]) => lists.find(i => i.id.includes(listIri!)))
  );

  hasProjectAdminRights$ = this._projectPageService.hasProjectAdminRights$;
  project$ = this._projectPageService.currentProject$;

  isListsLoading$ = this._store.select(ListsSelectors.isListsLoading);

  private _destroy = new Subject<void>();

  constructor(
    private _actions$: Actions,
    private _dialog: DialogService,
    private _listItemService: ListItemService,
    private _matDialog: MatDialog,
    private _projectPageService: ProjectPageService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.rootListNodeInfo$.pipe(takeUntil(this._destroy)).subscribe(list => {
      if (list && list.isRootNode && list.projectIri) {
        this._listItemService.setProjectInfos(list.projectIri, list.id);
      }
    });

    this._actions$
      .pipe(
        ofActionSuccessful(DeleteListNodeAction),
        switchMap(() => this._projectPageService.currentProject$),
        takeUntil(this._destroy)
      )
      .subscribe(project => {
        this._navigateToDataModels();
        this._store.dispatch(new LoadListsInProjectAction(project.id));
      });
  }

  editList(list: ListNodeInfo) {
    this._matDialog.open<ListInfoFormComponent, ListNodeInfo>(ListInfoFormComponent, {
      ...DspDialogConfig.dialogDrawerConfig(list, true),
      viewContainerRef: this._viewContainerRef,
    });
  }

  askToDeleteList(list: ListNodeInfo): void {
    this._dialog
      .afterConfirmation('Do you want to delete this controlled vocabulary?', list.labels[0].value)
      .pipe(switchMap(() => this._store.dispatch(new DeleteListNodeAction(list.id))))
      .subscribe();
  }

  private _navigateToDataModels() {
    const projectUuid = this._route.snapshot.params[RouteConstants.uuidParameter];
    this._router.navigate([RouteConstants.project, projectUuid, RouteConstants.dataModels]);
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }
}
