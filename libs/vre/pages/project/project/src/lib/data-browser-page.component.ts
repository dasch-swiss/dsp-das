import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { first } from 'rxjs';
import { ProjectPageService } from './project-page.service';

@Component({
  selector: 'app-data-browser-page',
  template: `<div style="display: flex; justify-content: center; align-items: center; height: 400px">
    <div>
      <app-progress-indicator />
      <div>Data is loading</div>
    </div>
  </div> `,
})
export class DataBrowserPageComponent implements OnInit {
  constructor(
    private _projectPageService: ProjectPageService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._projectPageService.ontologies$.pipe(first()).subscribe(ontologies => {
      const [ontologyIri, className] = Object.values(ontologies[0].classes)[0].id.split('#');
      const ontologyName = OntologyService.getOntologyNameFromIri(ontologyIri);
      this._router.navigate(['..', 'ontology', ontologyName, className], { relativeTo: this._route });
    });
  }
}
