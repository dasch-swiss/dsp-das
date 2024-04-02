import { Component } from '@angular/core';

@Component({
  selector: 'app-properties-display-header',
  template: ` <div class="toolbar" *ngIf="project" [class.deleted]="deletedResource || resource.res.isDeleted">
    <!-- resource info -->
    <h3 class="label mat-headline-6">{{ resource.res.label }} <span *ngIf="deletedResource">(deleted)</span></h3>

    <span class="fill-remaining-space"></span>

    <!-- tools: share, add to favorites, edit, delete etc. -->
    <span class="action">
      <!-- Toggle list of properties: all or only the ones with value -->
      <button
        color="primary"
        mat-icon-button
        class="toggle-props"
        *ngIf="!resource.res.isDeleted"
        [matTooltip]="(showAllProps ? 'Hide empty' : 'Show all') + ' properties'"
        matTooltipPosition="above"
        (click)="toggleAllProps(showAllProps)">
        <mat-icon>{{ showAllProps ? 'unfold_less' : 'unfold_more' }}</mat-icon>
        <!-- <span class="desktop-only">{{showAllProps ? 'Hide empty' : 'Show all'}} properties</span> -->
      </button>

      <!-- Share resource: copy ark url, add to favorites or open in new tab -->
      <button
        color="primary"
        mat-icon-button
        class="share-res"
        matTooltip="Share resource: {{ resource.res.versionArkUrl }}"
        matTooltipPosition="above"
        [disabled]="deletedResource"
        [matMenuTriggerFor]="share">
        <mat-icon>share</mat-icon>
        <!-- <span class="desktop-only">Citation Link</span> -->
      </button>
      <mat-menu #share="matMenu" class="res-share-menu">
        <button
          mat-menu-item
          matTooltip="Copy ARK url"
          matTooltipPosition="above"
          [cdkCopyToClipboard]="resource.res.versionArkUrl"
          (click)="openSnackBar('ARK URL copied to clipboard!')">
          <mat-icon>content_copy</mat-icon>
          Copy ARK url to clipboard
        </button>
        <button
          mat-menu-item
          matTooltip="Copy internal link"
          matTooltipPosition="above"
          [cdkCopyToClipboard]="resource.res.id"
          (click)="openSnackBar('Internal link copied to clipboard!')">
          <mat-icon>content_copy</mat-icon>
          Copy internal link to clipboard
        </button>
        <button
          mat-menu-item
          matTooltip="Open in new tab"
          matTooltipPosition="above"
          (click)="openResource(resource.res.id)">
          <mat-icon>open_in_new</mat-icon>
          Open resource in new tab
        </button>
        <!-- TODO: activate favorite action to add resource to collection -->
        <!--
                    <button mat-button class="add-res-to-collection">
                        <mat-icon>star_border</mat-icon>
                    </button>
                    -->
      </mat-menu>

      <!-- permission info: display full info in case of system or project admin; otherwise display only user's permissions -->
      <app-permission-info
        *ngIf="adminPermissions"
        [hasPermissions]="resource.res.hasPermissions"
        [userHasPermission]="resource.res.userHasPermission"></app-permission-info>
      <app-permission-info
        *ngIf="!adminPermissions"
        [userHasPermission]="resource.res.userHasPermission"></app-permission-info>
      <!-- more menu with: delete, erase resource -->
      <button
        color="primary"
        *ngIf="userCanEdit && project?.status"
        mat-icon-button
        class="more-menu"
        matTooltip="More"
        matTooltipPosition="above"
        [matMenuTriggerFor]="more"
        [disabled]="deletedResource">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #more="matMenu" class="res-more-menu">
        <button
          [disabled]="!userCanEdit"
          mat-menu-item
          matTooltip="Edit the label of this resource"
          matTooltipPosition="above"
          (click)="openDialog('edit')">
          <mat-icon>edit</mat-icon>
          Edit label
        </button>
        <button
          [disabled]="!userCanDelete"
          mat-menu-item
          matTooltip="Move resource to trash bin."
          matTooltipPosition="above"
          (click)="openDialog('delete')">
          <mat-icon>delete</mat-icon>
          Delete resource
        </button>
        <button
          *ngIf="adminPermissions"
          mat-menu-item
          matTooltip="Erase resource forever. This cannot be undone."
          matTooltipPosition="above"
          (click)="openDialog('erase')">
          <mat-icon>delete_forever</mat-icon>
          Erase resource
        </button>
      </mat-menu>
    </span>
  </div>`,
})
export class PropertiesDisplayHeaderComponent {}
