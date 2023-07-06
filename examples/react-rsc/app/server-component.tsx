import React, { use, useEffect } from "react";
import { createFromFetch } from "react-server-dom-vite/client";

declare global {
  interface Window {
    init_server: ReadableStream<Uint8Array> | null;
    chunk(chunk: string): Promise<void>;
  }
}

export function getServerElementStream(url: string) {
  let stream;
  // Ideally we should have a readable stream inlined in the HTML
  if (window.init_server) {
    stream = { body: window.init_server };
    self.init_server = null;
  } else {
    stream = fetch(`/_rsc${url}`, {
      headers: {
        Accept: "text/x-component",
        "x-navigate": url,
      },
    });
  }

  return stream;
}

export function ServerComponent({ url }: { url: string }) {
  return use(useServerElement(url));
}

export const serverElementCache = /*#__PURE__*/ new Map<
  string,
  Thenable<JSX.Element>
>();

export function useServerElement(url: string) {
  if (!serverElementCache.has(url)) {
    serverElementCache.set(
      url,
      createFromFetch(getServerElementStream(url), {
        callServer: () => {},
      })
    );
  }
  return serverElementCache.get(url)!;
}
