import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { AppFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<AppFileRouter>();
export const UploadDropzone = generateUploadDropzone<AppFileRouter>();
// Export helper hooks for custom UI integrations
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>();
