/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export const BuildTagSchema = z.object({
    build_tag: z.string().nonempty(),
});

export type BuildTag = z.infer<typeof BuildTagSchema>;
