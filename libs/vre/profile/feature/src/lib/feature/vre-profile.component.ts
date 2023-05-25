import { ChangeDetectionStrategy, Component, Inject, OnInit } from "@angular/core";
import { CommonModule } from '@angular/common';
import { DspApiConnectionToken } from "@dsp-app/src/app/main/declarations/dsp-api-tokens";
import { KnoraApiConnection } from "@dasch-swiss/dsp-js";
import { Session, SessionService } from "@dsp-app/src/app/main/services/session.service";
import { CacheService } from "@dsp-app/src/app/main/cache/cache.service";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { ProgressIndicatorComponent } from "@dsp/vre/shared/ui";

@Component({
    selector: 'dsp-vre-profile',
    standalone: true,
    imports: [CommonModule, ProgressIndicatorComponent],
    templateUrl: './vre-profile.component.html',
    styleUrls: ['./vre-profile.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VreProfileComponent implements OnInit {

    loading = false;
    error = false;

    session: Session | null;

    route: string;

    constructor(
      @Inject(DspApiConnectionToken)
      private _dspApiConnection: KnoraApiConnection,
      private _session: SessionService,
      private _cache: CacheService,
      private _route: ActivatedRoute,
      private _titleService: Title
    ) {
        // get the activated route; we need it for the viewer switch
        this.route = this._route.pathFromRoot[1].snapshot.url[0].path;

        // get session
        this.session = this._session.getSession();

        // set the page title if the session is not null
        if (this.session) {
            this._titleService.setTitle(this.session.user.name);
        }
    }

    ngOnInit() {
        this.initContent();
    }

    initContent() {
        this.loading = true;
        this.loading = false;
    }


}
