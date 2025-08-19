import { DspResource } from '@dasch-swiss/vre/shared/app-common';

export class SetCurrentResourceAction {
  static readonly type = '[Resource] Set Current Resource';

  constructor(public resource: DspResource | null) {}
}
