import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiServiceError, Project, ProjectsService, Session, User, UsersService } from '@knora/core';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {

    loading: boolean;

    projects: Project[] = [];
    active: Project[] = [];
    inactive: Project[] = [];

    selectedProject: Project;

    constructor(private _cache: CacheService,
                private _projectsService: ProjectsService,
                private _router: Router,
                private _usersService: UsersService) {
    }

    ngOnInit() {

        this.getUsersProjects();
    }

    getUsersProjects() {

        const session: Session = JSON.parse(localStorage.getItem('session'));

        if (session && session.user.sysAdmin) {
            // the logged-in user is system administrator;
            // he has access to every project
            this._projectsService.getAllProjects()
                .subscribe(
                    (result: Project[]) => {
                        this.projects = result;
                        for (const p of this.projects) {

                            if (p.status === true) {
                                this.active.push(p);
                            } else {
                                this.inactive.push(p);
                            }
                        }
                    },
                    (error: ApiServiceError) => {
                        console.error(error);
                    }
                );
        } else {
            // the logged-in user has no system admin rights;
            // he get only his own projects
            this._usersService.getUserByEmail(session.user.name)
                .subscribe(
                    (result: User) => {
                        this.projects = result.projects;
                        for (const p of this.projects) {

                            if (p.status === true) {
                                this.active.push(p);
                            } else {
                                this.inactive.push(p);
                            }
                        }
                    },
                    (error: ApiServiceError) => {
                        console.error(error);
                    }
                );
        }

        // TODO: in case of sys admin: is it possible to mix all projects with user's projects to mark them somehow in the list?!
    }

    /**
     *
     * @param id
     */
    setProject(id: string) {
        // get project by id
        // by searching in the list of projects
        // instead of an additional api request
        this.projects.filter(project => {

            if (project.id === id) {

                this._router.navigateByUrl('/refresh', {skipLocationChange: true}).then(() =>
                    this._router.navigate(['/project/' + project.shortcode])
                );

                // this._router.navigate(['/project/' + project.shortname + '/dashboard']);

                // location.reload(true);
            }
        });
    }
}
