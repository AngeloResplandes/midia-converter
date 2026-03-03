import { serve } from "bun";
import index from "./index.html";
import { destroyResource } from "./server/cloudinary";

// ─── Server ────────────────────────────────────────────────────────────────
const server = serve({
  routes: {
    // Serve the SPA for all non-API requests
    "/*": index,

    // ── Config — returns public Cloudinary settings to the frontend ─────────
    "/api/config": {
      GET() {
        return Response.json({
          cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
          uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET ?? "",
        });
      },
    },

    // ── Delete — removes a resource from Cloudinary by public_id ────────────
    "/api/delete/:id": {
      async DELETE(req) {
        const { id } = req.params;
        try {
          await destroyResource(id);
          return Response.json({ message: "Deletado" });
        } catch (err) {
          return Response.json({ error: String(err) }, { status: 500 });
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);

