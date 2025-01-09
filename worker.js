addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Serve the upload form at the root ("/")
  if (url.pathname === "/") {
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File Upload</title>
      </head>
      <body>
        <h1>Upload your file</h1>
        <form method="POST" action="/upload" enctype="multipart/form-data">
          <label for="file">Choose file:</label>
          <input type="file" id="file" name="file" accept=".jpg, .png" required>
          <button type="submit">Upload</button>
        </form>
      </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Handle file uploads at "/upload"
  if (url.pathname === "/upload" && request.method === "POST") {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file.name.endsWith(".jpg") || file.name.endsWith(".png"))) {
      return new Response("Invalid file format. Please upload a .jpg or .png file.", { status: 400 });
    }

    // Process the uploaded file
    const fileContents = await file.arrayBuffer();
    const fileSize = fileContents.byteLength;

    // Here you can add your logic (e.g., pass it to a PSD processing library or API)
    console.log(`Processing file: ${file.name} (size: ${fileSize} bytes)`);

    // Return a success response without saving the file
    return new Response(`File processed successfully: ${file.name} (size: ${fileSize} bytes)`, { status: 200 });
  }

  // Serve assets from R2 bucket (optional, if needed)
  if (url.pathname.startsWith("/assets/")) {
    const fileName = url.pathname.replace("/assets/", "");
    const object = await env.bookup_assets_bucket.get(fileName);

    if (!object) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(object.body, { headers: { "Content-Type": object.httpMetadata.contentType } });
  }

  return new Response("Invalid request", { status: 400 });
}
