import { Constants, CreateFileValue, UpdateStillImageFileValue } from '@dasch-swiss/dsp-js';

interface FileValueParameters {
  create?: () => CreateFileValue;
  update: () => UpdateStillImageFileValue;
}

export const FileValueMapping = new Map<string, FileValueParameters>([
  [Constants.HasStillImageFileValue, { update: new UpdateStillImageFileValue() }],
]);
