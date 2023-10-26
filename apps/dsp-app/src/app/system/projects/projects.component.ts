import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { StoredProject } from '@dasch-swiss/dsp-js';
import { UserSelectors, ProjectsSelectors, LoadProjectsAction } from '@dasch-swiss/vre/shared/app-state';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * projects component handles the list of projects
 * It's used in user-profile, on system-projects
 * but also on the landing page
 *
 * We build to lists: one with active projects
 * and another one with already deactivate (inactive) projects
 *
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    
    @Input() username?: string;

    @Select(UserSelectors.username) username$: Observable<string>;
    
    /**
     * if username is definded: show only projects,
     * where this user is member of;
     * otherwise show all projects
     */
    @Select(ProjectsSelectors.activeProjects) activeProjects$: Observable<StoredProject[]>;
    @Select(ProjectsSelectors.inactiveProjects) inactiveProjects$: Observable<StoredProject[]>;
    @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;

    constructor(
        private _titleService: Title,
        private _store: Store,
    ) {
    }

    ngOnInit() {
        this.username$.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(username => username 
                ? this._titleService.setTitle('Your projects') 
                : this._titleService.setTitle('All projects from DSP'));
        
        if (this._store.selectSnapshot(ProjectsSelectors.allProjects).length === 0) {
            this.refresh();
        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * refresh list of projects after updating one
     */
    refresh(): void {
        this._store.dispatch(new LoadProjectsAction());
    }
}
