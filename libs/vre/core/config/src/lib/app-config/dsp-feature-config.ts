/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { FeatureFlagsType } from './app-config';

export class DspFeatureFlagsConfig {
  constructor(public readonly allowEraseProjects: FeatureFlagsType['allowEraseProjects']) {}
}
