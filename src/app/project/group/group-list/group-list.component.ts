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

  constructor(
    private _groupsService: GroupsService,
    private _cache: CacheService) { }

  ngOnInit() {
    this.loading = true;
    // this.setList();
  }

  /**
   * Set the list of groups for the targeted project
   */
  setList() {
    /* TODO: set the list when we will get more information about the group */
  }

}
