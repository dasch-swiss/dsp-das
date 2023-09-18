export class RouteConstants {
    static readonly home = '';
    static readonly userAccount = 'account';
    static readonly systemAdmin = 'system';

    static readonly refresh = 'refresh';

    static readonly noNetworkError = 'no-network';
    static readonly notFound = '404';
    static readonly notFoundWildcard = '**';

    static readonly homeRelative = `/${RouteConstants.home}`;
    static readonly userAccountRelative = `/${RouteConstants.userAccount}`;
    static readonly systemAdminRelative = `/${RouteConstants.systemAdmin}`;

    static readonly notFoundWildcardRelative = `/${RouteConstants.notFound}`;
}

export enum Auth {
    AccessToken = 'ACCESS_TOKEN',
    Refresh_token = 'REFRESH_TOKEN',
    Bearer = 'Bearer',
}
