import { Injectable, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UpdateService implements OnDestroy {
  private _destroy: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private _snackBar: MatSnackBar,
    private _swUpdate: SwUpdate
  ) {
    if (this._swUpdate.isEnabled) {
      this._checkForUpdates();
    }
  }

  private _checkForUpdates() {
    this._swUpdate.versionUpdates.pipe(takeUntil(this._destroy)).subscribe(event => {
      if (event.type === 'VERSION_READY') {
        this._showSnackbarAnUpdate();
      }
    });

    this._swUpdate
      .checkForUpdate()
      .then(hasUpdate => {
        if (hasUpdate) {
          this._showSnackbarAnUpdate();
        }
      })
      .catch(err => console.error('Error checking for updates:', err));
  }

  private _showSnackbarAnUpdate() {
    const snackbarRef = this._snackBar.open(
      'A new version of the Gossembrot-DB is available. The page will be reloaded with the updated state.',
      'Close',
      {
        duration: 5000,
      }
    );

    snackbarRef.afterDismissed().subscribe(() => {
      window.location.reload();
    });

    snackbarRef.onAction().subscribe(() => {
      window.location.reload();
    });
  }

  ngOnDestroy() {
    this._destroy.next(true);
    this._destroy.complete();
  }
}
