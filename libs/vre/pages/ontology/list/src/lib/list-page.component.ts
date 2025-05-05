import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ListNodeInfo } from '@dasch-swiss/dsp-js';
import { DspDialogConfig, RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  DeleteListNodeAction,
  ListsSelectors,
  LoadListsInProjectAction,
  ProjectsSelectors,
} from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { combineLatest } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { EditListInfoDialogComponent } from './reusable-list-info-form/edit-list-info-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-list',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
})
export class ListPageComponent implements OnInit {
  disableContent = false;

  private readonly routeListIri$ = this._route.paramMap.pipe(map(params => params.get(RouteConstants.listParameter)));

  currentList$ = combineLatest([this._store.select(ListsSelectors.listsInProject), this.routeListIri$]).pipe(
    map(([lists, listIri]) => lists.find(i => i.id.includes(listIri!)))
  );

  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  isListsLoading$ = this._store.select(ListsSelectors.isListsLoading);

  constructor(
    private _dialog: DialogService,
    private _matDialog: MatDialog,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _actions$: Actions
  ) {}

  @HostListener('window:resize', ['$event']) onWindowResize() {
    this.disableContent = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.disableContent = window.innerWidth <= 768;
  }

  editList(list: ListNodeInfo) {
    this._matDialog.open<EditListInfoDialogComponent, ListNodeInfo, boolean>(
      EditListInfoDialogComponent,
      DspDialogConfig.dialogDrawerConfig(list, true)
    );
  }

  askToDeleteList(list: ListNodeInfo): void {
    this._dialog
      .afterConfirmation('Do yu want to delete this controlled vocabulary?', list.labels[0].value)
      .pipe(
        take(1),
        switchMap(() => this._store.dispatch(new DeleteListNodeAction(list.id)))
      )
      .pipe(switchMap(() => this._actions$.pipe(ofActionSuccessful(DeleteListNodeAction), take(1))))
      .subscribe(() => {
        this._store.dispatch(new LoadListsInProjectAction(list.projectIri!));
        const projectUuid = ProjectService.IriToUuid(list.projectIri!);
        this._router.navigate([RouteConstants.project, projectUuid, RouteConstants.dataModels]);
      });
  }
}
