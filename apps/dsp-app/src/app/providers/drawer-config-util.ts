import { MatDialogConfig } from '@angular/material/dialog';

export class DialogConfigUtil {
  static dialogDrawerConfig<T>(dialogData: T = null): MatDialogConfig<T> {
    return {
      height: 'calc(100vh - 72px)', // 72px == height of the header
      position: {
        top: '72px', // same as the header
        right: '0px',
      },
      autoFocus: true,
      enterAnimationDuration: 0,
      exitAnimationDuration: 0,
      data: dialogData,
    };
  }
}
