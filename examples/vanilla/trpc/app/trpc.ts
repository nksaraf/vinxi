import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// You can use any variable name you like.
// We use t to keep things simple.
export const t = initTRPC.create({
	transformer: superjson,
});
