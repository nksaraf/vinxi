import { t } from "../trpc";

const appRouter = t.router({
	greeting: t.procedure.query(() => "hello tRPC v10!"),
});

export default appRouter;

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
