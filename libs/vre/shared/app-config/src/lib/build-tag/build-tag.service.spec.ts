/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TestBed } from '@angular/core/testing';

import { BuildTagService } from './build-tag.service';
import { BuildTagToken } from './build-tag-token';

describe('BuildTagService', () => {
    let service: BuildTagService;
    const buildJson = {
        build_tag: 'v1.0.0',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: BuildTagToken,
                    useValue: buildJson,
                },
            ],
        });
        service = TestBed.inject(BuildTagService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the parsed build_tag', () => {
        expect(service.getBuildTag()).toEqual({ build_tag: 'v1.0.0' });
    });
});
