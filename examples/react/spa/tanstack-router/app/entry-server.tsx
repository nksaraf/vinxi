import { handleServerAction } from "@vinxi/plugin-references/server-handler";
import { eventHandler } from "vinxi/http";

export default eventHandler(handleServerAction);
