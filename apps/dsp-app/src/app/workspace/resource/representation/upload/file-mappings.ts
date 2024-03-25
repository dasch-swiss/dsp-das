import {
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
    'stillImage',
    {
      fileTypes: ['jp2', 'jpg', 'jpeg', 'png', 'tif', 'tiff'],
      uploadClass: CreateStillImageFileValue,
    },
  ],
  ['movingImage', { fileTypes: ['mp4'], uploadClass: CreateMovingImageFileValue }],
  ['audio', { fileTypes: ['mp3', 'wav'], uploadClass: CreateAudioFileValue }],
  [
    'document',
    {
      fileTypes: ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'],
      uploadClass: CreateDocumentFileValue,
    },
  ],
  ['text', { fileTypes: ['csv', 'odd', 'rng', 'txt', 'xml', 'xsd', 'xsl'], uploadClass: CreateTextFileValue }],
  ['archive', { fileTypes: ['7z', 'gz', 'gzip', 'tar', 'tgz', 'z', 'zip'], uploadClass: CreateArchiveFileValue }],
]);
