import {
  Constants,
  CreateArchiveFileValue,
  CreateAudioFileValue,
  CreateDocumentFileValue,
  CreateFileValue,
  CreateMovingImageFileValue,
  CreateStillImageFileValue,
  CreateTextFileValue,
} from '@dasch-swiss/dsp-js';
import { FileRepresentationType } from '@dsp-app/src/app/workspace/resource/representation/upload/file-representation.type';

export const fileValueMapping = new Map<
  FileRepresentationType,
  {
    fileTypes: string[];
    uploadClass: new () => CreateFileValue;
  }
>([
  [
    Constants.HasStillImageFileValue as FileRepresentationType,
    {
      fileTypes: ['jp2', 'jpg', 'jpeg', 'png', 'tif', 'tiff'],
      uploadClass: CreateStillImageFileValue,
    },
  ],
  [
    Constants.HasMovingImageFileValue as FileRepresentationType,
    {
      fileTypes: ['mp4'],
      uploadClass: CreateMovingImageFileValue,
    },
  ],
  [
    Constants.HasAudioFileValue as FileRepresentationType,
    {
      fileTypes: ['mp3', 'wav'],
      uploadClass: CreateAudioFileValue,
    },
  ],
  [
    Constants.HasDocumentFileValue as FileRepresentationType,
    {
      fileTypes: ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'],
      uploadClass: CreateDocumentFileValue,
    },
  ],
  [
    Constants.HasTextFileValue as FileRepresentationType,
    {
      fileTypes: ['csv', 'odd', 'rng', 'txt', 'xml', 'xsd', 'xsl'],
      uploadClass: CreateTextFileValue,
    },
  ],
  [
    Constants.HasArchiveFileValue as FileRepresentationType,
    {
      fileTypes: ['7z', 'gz', 'gzip', 'tar', 'tgz', 'z', 'zip'],
      uploadClass: CreateArchiveFileValue,
    },
  ],
]);
