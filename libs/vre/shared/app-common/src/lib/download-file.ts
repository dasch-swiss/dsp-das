/**
 * Hands a blob to the browser as a file download under the given name.
 *
 * Encoding concerns stay with the caller: which MIME type to declare, and whether the content needs
 * a UTF-8 BOM, are per-format decisions (see DEV-6987) rather than download mechanics.
 */
export const triggerBlobDownload = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  // The anchor is attached to the document before the click and removed after, which is what the
  // CSV export call sites have always done.
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
};
