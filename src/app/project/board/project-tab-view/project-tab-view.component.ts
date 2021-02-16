import { Component, Input, OnInit, ɵConsole } from '@angular/core';
import { SingleProject, DataManagementPlan, IId } from '@dasch-swiss/dsp-js';

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

    ngOnInit() {
        if (this.selectedProject.dataManagementPlan) {
            this.dmps = this.getDMP(this.selectedProject.dataManagementPlan);
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

    getFunder() {
        
    }

}
