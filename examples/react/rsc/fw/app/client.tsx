/// <reference types="vinxi/types/client" />
import { ServerComponent } from "@vinxi/react-server/client";
import { createRoot } from "react-dom/client";

createRoot(document).render(<ServerComponent url={window.location.pathname} />);
