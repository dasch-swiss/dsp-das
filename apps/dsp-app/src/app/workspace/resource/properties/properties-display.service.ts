import { BehaviorSubject } from 'rxjs';

export class PropertiesDisplayService {
  private _showAllProperties = new BehaviorSubject(false);
  showAllProperties$ = this._showAllProperties.asObservable();

  toggleShowProperties() {
    this._showAllProperties.next(!this._showAllProperties.value);
  }
}
