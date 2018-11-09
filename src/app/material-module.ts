import { NgModule } from '@angular/core';

import * as MAT_MODULES from '@angular/material';

export function mapMatlModules() {
  return Object.keys(MAT_MODULES).filter((k) => {
    const asset = MAT_MODULES[k];
    return typeof asset === 'function' && asset.name.startsWith('Mat') && asset.name.includes('Module');
  }).map((k) => MAT_MODULES[k]);
}

const modules = mapMatlModules();

@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule {
}

