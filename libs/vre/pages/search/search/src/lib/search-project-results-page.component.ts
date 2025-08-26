import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-project-results-page',
  template: `GOOD`,
})
export class SearchProjectResultsPageComponent implements OnInit {
  constructor(private _route: ActivatedRoute) {}

  ngOnInit() {
    this._route.params.subscribe(params => {
      console.log('asd', params);
    });
  }
}
