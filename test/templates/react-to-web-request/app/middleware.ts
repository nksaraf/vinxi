import { defineMiddleware, toWebRequest } from "vinxi/server";

export default defineMiddleware({
  onRequest: event => {
    toWebRequest(event);
  }
});