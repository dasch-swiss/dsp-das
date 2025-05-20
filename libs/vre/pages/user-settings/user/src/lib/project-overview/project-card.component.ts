import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { StoredProject } from '@dasch-swiss/dsp-js';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';

@Component({
  selector: 'app-project-card',
  template: `
    <div class="project-card-wrapper" data-cy="project-card">
      <a [routerLink]="[RouteConstants.project, projectUuid]">
        <mat-card class="project-card" appearance="outlined" (keydown.enter)="navigate()">
          <div mat-card-image class="image-container">
            <img
              *ngIf="!imageCantLoad; else backgroundTpl"
              mat-card-image
              [src]="'assets/images/project/width-500/' + project.shortcode + '.webp'"
              alt="image of project"
              (error)="imageCantLoad = true"
              class="img" />
          </div>

          <mat-card-content class="project-content">
            <div class="project-details">
              <mat-card-title class="project-title">
                {{ project.longname }}
              </mat-card-title>
              <mat-card-subtitle class="project-subtitle">
                <span>{{ project.shortname }}</span>
                <span>|</span>
                <span>{{ project.shortcode }}</span>
              </mat-card-subtitle>
            </div>
          </mat-card-content>
        </mat-card>
      </a>
    </div>

    <ng-template #backgroundTpl>
      <div class="backup-text" [ngClass]="{ small: project.shortname.length > 10 }">
        <span>{{ project.shortname }}</span>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .img {
        filter: sepia(0.5);
      }

      .project-card-wrapper {
        position: relative;
        height: 100%;
      }

      .project-card {
        display: flex;
        border-radius: 8px;
        cursor: pointer;
        color: var(--primary);
        transition:
          background-color 0.2s ease,
          box-shadow 0.2s ease;

        .project-content {
          display: flex;
        }

        .project-details {
          padding-top: 8px;

          .project-title {
            color: black;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin: 0;
          }

          .project-subtitle > span {
            margin-right: 0.5rem;
          }
        }
      }

      .project-card:hover,
      .project-card:focus {
        background-color: white;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        position: absolute;
        z-index: 1;
        width: 100%;

        .project-details .project-title {
          -webkit-line-clamp: unset;
        }
      }

      .image-container {
        width: 100%;
        height: 200px; /* Or any fixed height you want */
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.1) 100%);
        }
      }

      .image-container img {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Ensures it covers the container without distortion */
      }

      .backup-text {
        background: #ffecbd;
        color: #bfa153;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        font-weight: bold;
        text-transform: uppercase;

        &.small {
          font-size: 24px;
        }
      }
    `,
  ],
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: StoredProject;
  @Input({ required: true }) index!: number;

  imageCantLoad = false;

  get projectUuid() {
    return ProjectService.IriToUuid(this.project.id);
  }

  constructor(private _router: Router) {}

  navigate() {
    this._router.navigate([RouteConstants.project, this.projectUuid]);
  }

  protected readonly RouteConstants = RouteConstants;
}
