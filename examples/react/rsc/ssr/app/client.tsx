import { ServerComponent } from "@vinxi/react-server-dom/client";
import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
	hydrateRoot(document, <ServerComponent url={window.location.pathname} />);
});
