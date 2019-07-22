import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OntologyInfo } from '../ontology.component';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'app-ontology-list',
    templateUrl: './ontology-list.component.html',
    styleUrls: ['./ontology-list.component.scss']
})
export class OntologyListComponent implements OnInit {

    loading: boolean;

    @Input() ontologies: OntologyInfo[];

    ontologyForm: FormGroup;

    newOntologyId: string;

    // i18n setup
    itemPluralMapping = {
        ontology: {
            // '=0': '0 Ontologies',
            '=1': '1 data model',
            other: '# data models'
        }
    };

    constructor (
        private _route: ActivatedRoute,
        private _router: Router,
        private _formBuilder: FormBuilder) {
    }

    ngOnInit() {

        this.loading = true;

        console.log(this.ontologies);

        this.ontologyForm = this._formBuilder.group({
            ontology: new FormControl({
                value: '', disabled: false
            }, [
                    Validators.required
                ])
        });

        this.loading = false;

        this.ontologyForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
    }

    onValueChanged(data?: any) {


        if (!this.ontologyForm) {
            return;
        }

        // go to page with this id
        // this._router.navigateByUrl(this._router.url.replace(id, data.ontology));

        if (data.ontology === 'new') {
            // TODO: open dialog box and set name for new ontology
            // go to route with this ontology name
        }
        const id = encodeURIComponent(data.ontology);



    }

    openOntology(id: string) {
        this._router.navigate([id], { relativeTo: this._route });
    }

}
