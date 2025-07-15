import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { AdminGroupsApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AutocompleteItem } from '@dasch-swiss/vre/pages/user-settings/user';
import { map } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-select-group',
  templateUrl: './select-group.component.html',
  styleUrls: ['./select-group.component.scss'],
})
export class SelectGroupComponent implements AfterViewInit {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) disabled!: boolean;
  @Input({ required: true }) permissions: any;
  @Output() groupChange = new EventEmitter<any>();

  projectGroups$ = this._adminGroupsApi.getAdminGroups().pipe(
    map(response => {
      const projectGroups = response.groups ?? [];
      const groups = projectGroups.filter(group => (group.project!.id as unknown as string) === this.projectId);

      return groups.map(
        group =>
          <AutocompleteItem>{
            iri: group.id,
            name: group.name,
          }
      );
    })
  );

  groupCtrl = new UntypedFormControl();

  constructor(private _adminGroupsApi: AdminGroupsApiService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.groupCtrl.setValue(this.permissions);
    });
  }

  trackByFn = (index: number, item: AutocompleteItem) => `${index}-${item.label}`;

  onGroupChange() {
    if (!this.groupCtrl.value) {
      return;
    }

    if (this._sort(this.permissions, this.groupCtrl.value)) {
      this.permissions = this.groupCtrl.value;
      this.groupChange.emit(this.groupCtrl.value);
    }
  }

  private _sort(arrOne: string[], arrTwo: string[]): boolean {
    return [...arrOne].sort().join(',') !== [...arrTwo].sort().join(',');
  }
}
