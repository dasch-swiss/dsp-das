/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { inject, Injectable } from '@angular/core';
import { BuildTagToken } from './build-tag-token';
import { BuildTag, BuildTagSchema } from './build-tag';

@Injectable({
    providedIn: 'root',
})
export class BuildTagService {
    private buildJson = inject(BuildTagToken);

    getBuildTag(): BuildTag {
        return BuildTagSchema.parse(this.buildJson);
    }
}
