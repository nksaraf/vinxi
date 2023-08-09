import { eventHandler } from "vinxi/runtime/server";

import { handleServerAction } from "../lib/server-action";

export default eventHandler(handleServerAction);
