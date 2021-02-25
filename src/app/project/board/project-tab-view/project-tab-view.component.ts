import { Component, Input, OnInit } from '@angular/core';
import { 
    SingleProject, 
    DataManagementPlan, 
    Person, 
    Organization, 
    IId, 
    Grant 
} from '@dasch-swiss/dsp-js';

@Component({
    selector: 'app-project-tab-view',
    templateUrl: './project-tab-view.component.html',
    styleUrls: ['./project-tab-view.component.scss']
})
export class ProjectTabViewComponent implements OnInit {

    // metadata object
    @Input() selectedProject: SingleProject;
    @Input() subProperties: Object;

    // metadata keys that we do not want to display in template
    excludeKeys = ['contactPoint'];

    // list of date keys from metadata object
    // used for formatting
    dateKeys = ['startDate', 'endDate'];

    dmps: DataManagementPlan[] = [];
    funders: Person[] | Organization [] = [];
    funderType: string;
    grants = [];

    ngOnInit() {

        // get DMP
        if (this.selectedProject.dataManagementPlan) {
            this.dmps = this.getDMP(this.selectedProject.dataManagementPlan);
        }

        // get funder details
        this.getFunders(this.selectedProject.funder);

        // get grants if present
        if (this.selectedProject.grant) {
            this.getGrants(this.selectedProject.grant);
        }

    }

    getDMP(currenDmps) {
        if (currenDmps instanceof DataManagementPlan){
            return [currenDmps];
        }
        else {
            let tmp: DataManagementPlan[] = [];
            for (let iid of currenDmps) {
                tmp.push(this.subProperties[iid.id]);
            }
            return tmp;
        }
    }

    getFunders(flist) {
        // check if it is person, organization or IId
        this.funderType = this.getFunderType(flist[0]);

        if (this.funderType) {
            this.funders = flist;
        }
        else {
            for (let funder of flist) {
                this.funders.push(this.subProperties[funder.id]);
            }
            this.funderType = this.getFunderType(this.funders[0]);
        }
    }

    getFunderType(funder: Person | Organization | IId) {
        if (funder instanceof Person){
            return 'person';
        }
        else if (funder instanceof Organization){
            return 'organization';
        }
        return undefined;
    }

    getGrants(glist) {
        let tmpGrants: Grant[] = [];

        if (glist[0] instanceof Grant) {
            tmpGrants = glist;
        }
        // if it is IId objects array, retrive it's details
        else {
            for (let iid of glist) {
                tmpGrants.push(this.subProperties[iid.id]);
            }
        }
        // get funder details along with other details
        for (let grant of tmpGrants) {
            let tmpGrantObj: object;

            // checck if grant contains person, organization or IId objects
            let ftype = this.getFunderType(grant.funder[0]);
            let flist = [];
            if (ftype) {
                // it is a person of organization object
                flist = grant.funder;
            }
            else {
                // it means it is a IId object. So we need to retrive the details 
                // of every funder using the id provided here
                for (let fund of grant.funder) {
                    flist.push(this.subProperties[fund.id]);
                }
                ftype = this.getFunderType(flist[0]);
            }

            tmpGrantObj = {
                funder : flist,
                funderType: ftype,
                name: grant.name? grant.name : undefined,
                number: grant.number? grant.number : undefined,
                url: grant.url? grant.url : undefined
            };

            this.grants.push(tmpGrantObj);
        }
    }

}
