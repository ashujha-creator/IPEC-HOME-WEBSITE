import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const f = createUploadthing();

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

        if (!session || !session.user) {
          console.error("[UploadThing] Middleware: No active session found");
          throw new UploadThingError("Unauthorized");
        }

        return { userId: session.user.id };
      } catch (err) {
        console.error("[UploadThing] Auth error:", err);
        throw new UploadThingError("Unauthorized");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
