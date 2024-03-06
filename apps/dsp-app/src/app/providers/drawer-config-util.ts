import { MatDialogConfig } from '@angular/material/dialog';

export class DialogConfigUtil {
  static dialogDrawerConfig<T = undefined>(dialogData: T = undefined): MatDialogConfig<T> {
    return {
      minWidth: '50vw',
      minHeight: 'calc(100vh - 72px)', // 72px == height of the header
      position: {
        top: '72px', // same as the header
        right: '0px',
      },
      data: dialogData,
    };
  }
}
