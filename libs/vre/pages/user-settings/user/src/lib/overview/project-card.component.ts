import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StoredProject } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-project-card',
  template: `
    <div class="project-card-wrapper">
      <mat-card
        class="project-card"
        appearance="outlined"
        tabindex="0"
        (click)="projectClicked.emit()"
        (keydown.enter)="projectClicked.emit()">
        <div class="project-content">
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
        </div>
      </mat-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
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
          width: 100%;
        }
        .project-details {
          padding: 1rem;

          .project-title {
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
        background-color: var(--element-active-hover);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        position: absolute;
        z-index: 1;
        width: 100%;

        .project-details .project-title {
          -webkit-line-clamp: unset;
        }
      }
    `,
  ],
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: StoredProject;
  @Output() projectClicked: EventEmitter<void> = new EventEmitter();
}
