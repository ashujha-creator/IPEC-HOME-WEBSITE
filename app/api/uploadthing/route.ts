import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter, siteUploadRouter } from "./core";

// Combine both routers into a single router map
export const combinedRouter = {
  ...ourFileRouter,
  ...siteUploadRouter,
};

export const { GET, POST } = createRouteHandler({
  router: combinedRouter,
});
