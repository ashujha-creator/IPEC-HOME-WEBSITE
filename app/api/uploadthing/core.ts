import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_COUNT,
  MAX_FILE_SIZE_STRING,
} from "@/lib/user-sites/constants";

const f = createUploadthing();

export const siteUploadRouter = {
  siteFiles: f({
    // UploadThing's own type/size gate — this is the real enforcement layer,
    // since bytes land here regardless of what client-side Zod said.
    "text/html": {
      maxFileSize: MAX_FILE_SIZE_STRING,
      maxFileCount: MAX_FILE_COUNT,
    },
    "text/css": {
      maxFileSize: MAX_FILE_SIZE_STRING,
      maxFileCount: MAX_FILE_COUNT,
    },
    blob: {
      maxFileSize: MAX_FILE_SIZE_STRING,
      maxFileCount: MAX_FILE_COUNT,
    },
    image: {
      maxFileSize: MAX_FILE_SIZE_STRING,
      maxFileCount: MAX_FILE_COUNT,
    },
    "application/pdf": {
      maxFileSize: MAX_FILE_SIZE_STRING,
      maxFileCount: MAX_FILE_COUNT,
    },
  })
    .middleware(async () => {
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });

        if (!session?.user) {
          console.error("[UploadThing] Site files: No active session found");
          throw new UploadThingError("Unauthorized");
        }

        return { userId: session.user.id };
      } catch (err) {
        if (err instanceof UploadThingError) {
          throw err;
        }

        console.error("[UploadThing] Site files auth error:", err);
        throw new UploadThingError("Unauthorized");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Nothing persisted to Prisma here — the client still needs to send us
      // the declared relative path per file. UploadThing doesn't know your
      // "assets/logo.png" folder structure, so persistence happens in the
      // manifest API route after all files finish uploading.
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type SiteUploadRouter = typeof siteUploadRouter;

export const ourFileRouter = {
  galleryImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 10,
    },
  })
    .middleware(async () => {
      try {
        const session = await auth.api.getSession({
          headers: await headers(),
        });

        if (!session?.user) {
          console.error("[UploadThing] Middleware: No active session found");
          throw new UploadThingError("Unauthorized");
        }

        return { userId: session.user.id };
      } catch (err) {
        if (err instanceof UploadThingError) {
          throw err;
        }

        console.error("[UploadThing] Auth error:", err);
        throw new UploadThingError("Unauthorized");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export const appFileRouter = {
  ...ourFileRouter,
  ...siteUploadRouter,
};
export type AppFileRouter = typeof appFileRouter;
