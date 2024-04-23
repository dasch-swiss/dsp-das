import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss'],
})
export class SystemComponent implements OnInit {
  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;

  activeTabIndex = 0;

  constructor(
    private _location: Location,
    private _route: ActivatedRoute,
    private _titleService: Title
  ) {
    this._titleService.setTitle('System administration');
  }

  ngOnInit() {
    this._route.url.subscribe(urlSegments => {
      if (urlSegments.length > 0) {
        const lastSegment = urlSegments[urlSegments.length - 1].path;
        if (lastSegment === RouteConstants.systemUsers) {
          this.activeTabIndex = 1;
        } else if (lastSegment === RouteConstants.systemProjects) {
          this.activeTabIndex = 0;
        }
      }
    });
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
    if (this.activeTabIndex === 1) {
      this._location.go(`/${RouteConstants.system}/${RouteConstants.systemUsers}`);
    } else {
      this._location.go(`/${RouteConstants.system}/${RouteConstants.projects}`);
    }
  }
}
