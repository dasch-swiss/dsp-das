// In admin/routes.ts:
import { Route } from "@angular/router";
import { VreProfileComponent } from "./vre-profile.component";

export const PROFILE_ROUTES: Route[] = [
  {path: 'account', component: VreProfileComponent},
  {path: 'projects', component: VreProfileComponent},
];
