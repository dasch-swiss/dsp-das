export * from './admin-files-api.service';
import { AdminFilesApiService } from './admin-files-api.service';
export * from './admin-groups-api.service';
import { AdminGroupsApiService } from './admin-groups-api.service';
export * from './admin-lists-api.service';
import { AdminListsApiService } from './admin-lists-api.service';
export * from './admin-maintenance-api.service';
import { AdminMaintenanceApiService } from './admin-maintenance-api.service';
export * from './admin-permissions-api.service';
import { AdminPermissionsApiService } from './admin-permissions-api.service';
export * from './admin-projects-api.service';
import { AdminProjectsApiService } from './admin-projects-api.service';
export * from './admin-store-api.service';
import { AdminStoreApiService } from './admin-store-api.service';
export * from './admin-users-api.service';
import { AdminUsersApiService } from './admin-users-api.service';
export * from './v2-resources-api.service';
import { V2ResourcesApiService } from './v2-resources-api.service';
export * from './v2-search-api.service';
import { V2SearchApiService } from './v2-search-api.service';
export const APIS = [AdminFilesApiService, AdminGroupsApiService, AdminListsApiService, AdminMaintenanceApiService, AdminPermissionsApiService, AdminProjectsApiService, AdminStoreApiService, AdminUsersApiService, V2ResourcesApiService, V2SearchApiService];
