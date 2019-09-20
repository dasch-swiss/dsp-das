import { Component, OnInit, Input } from '@angular/core';
import { AutocompleteItem, Group, GroupsService, ApiServiceError } from '@knora/core';
import { CacheService } from '../../../main/cache/cache.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit {

  @Input() projectcode: string;

  @Input() projectIri: string;

  @Input() group: Group[];

  loading: boolean;

  // default system groups and project specific groups
  // projectGroupsList: Group[] = [];

  constructor(
    private _groupsService: GroupsService,
    private _cache: CacheService) { }

  ngOnInit() {
    this.loading = true;
    console.log('group from group component', this.group);
    // this.setList();
  }

  /**
   * Set the list of groups for the targeted project
   */
  setList() {
    /* this._groupsService.getAllGroups()
      .subscribe(
        (result: Group[]) => {
          console.log('result group list', result);
          for (const group of result) {
            if (group.project.id === this.projectIri) {
              this.projectGroupsList.push({
                id: group.id,
                name: group.name,
                description: group.description,
                project: group.project,
                status: group.status,
                selfjoin: group.selfjoin
              });
            }
          }
        },
        (error: ApiServiceError) => {
          console.error(error);
        }
      ); */
  }

}
