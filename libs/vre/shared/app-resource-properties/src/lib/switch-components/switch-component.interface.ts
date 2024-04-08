import { FormControl, FormGroup } from '@angular/forms';

export interface SwitchComponent {
  control: FormControl<any> | FormGroup;
  displayMode: boolean;
}
