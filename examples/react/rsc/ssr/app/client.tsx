import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { ServerComponent } from "@vinxi/react-rsc/client";
startTransition(() => {
	hydrateRoot(document, <ServerComponent url={window.location.pathname} />);
});
