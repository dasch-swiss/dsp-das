import { Component, Inject, OnInit } from '@angular/core';
import { AdvancedSearchService } from '../../services/advanced-search.service';
import { OntologiesMetadata } from '@dasch-swiss/dsp-js';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'dsp-app-advanced-search-new',
  templateUrl: './advanced-search-new.component.html',
  styleUrls: ['./advanced-search-new.component.scss']
})
export class AdvancedSearchNewComponent implements OnInit {

    ontologiesMetadata: OntologiesMetadata;
    form: FormGroup;

    constructor(
        private _advSearchService: AdvancedSearchService,
        @Inject(FormBuilder) private _fb: FormBuilder,
    ){}

    ngOnInit(): void {
        this.form = this._fb.group({});

        this._advSearchService.getAllOntologies().subscribe(
            (response: OntologiesMetadata) => {
                this.ontologiesMetadata = response;
                console.log('ontoMeta: ', this.ontologiesMetadata);
            }
        )
    }
}
