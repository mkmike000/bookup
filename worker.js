addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "POST") {
    const formData = await request.formData();
    const file = formData.get("file"); // File uploaded by the user
    const layerName = formData.get("layer"); // Optional layer parameter

    if (!file || (!file.name.endsWith(".jpg") && !file.name.endsWith(".png"))) {
      return new Response("Invalid file format. Please upload a .jpg or .png file.", {
        status: 400,
      });
    }

    try {
      // Assume mockup.psd is stored in the R2 bucket
      const mockup = await env.BOOKUP_ASSETS.get("mockup.psd");
      if (!mockup) {
        return new Response("Mockup file not found.", { status: 404 });
      }

      // Perform your processing here (e.g., replace PSD layer with the uploaded image)
      // Placeholder for actual PSD processing logic

      return new Response(`File uploaded: ${file.name}`, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      return new Response(`Server error: ${error.message}`, { status: 500 });
    }
  }

  return new Response("Use POST to upload your file", { status: 405 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/assets/")) {
      const fileName = url.pathname.replace("/assets/", "");
      const object = await env.bookup_assets_bucket.get(fileName);

      if (!object) {
        return new Response("File not found", { status: 404 });
      }

      return new Response(object.body, {
        headers: { "Content-Type": object.httpMetadata.contentType },
      });
    }

    return new Response("Invalid request", { status: 400 });
  },
};
