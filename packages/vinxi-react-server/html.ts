import { fileURLToPath } from "url";
import { eventHandler } from "vinxi/server";

const path = fileURLToPath(new URL("./app/client.tsx", import.meta.url));

export default eventHandler((event) => {
	return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
      <link rel="icon" href="/favicon.ico" />
    </head>
    <body>
      <div id="root"></div>
      <script src="/@fs${path}" type="module">
      </script>
    </body>
  </html>
  `;
});
