/*
 * Copyright © 2021 - 2023 Swiss National Data and Service Center for the Humanities and/or DaSCH Service Platform contributors.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GrafanaFaroService } from './grafana-faro.service';

/**
 * Factory function for APP_INITIALIZER to initialize Faro on application startup
 * @param faroService The Faro service to initialize
 * @returns A function that initializes Faro
 */
export function faroInitializer(faroService: GrafanaFaroService): () => void {
  return () => {
    try {
      faroService.setup();
    } catch (error) {
      // Fail silently - don't break the app if Faro fails to initialize
      console.error('Faro initialization failed:', error);
    }
  };
}
