/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export function initializeAppFactory(
    httpClient: HttpClient
): () => Observable<any> {
    return () =>
        httpClient
            .get('/config/build.json')
            .pipe(tap((buildTag) => console.log(buildTag)));
}
