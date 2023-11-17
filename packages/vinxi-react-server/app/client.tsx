/// <reference types="vinxi/types/client" />
import { createRoot } from "react-dom/client";

import { ServerComponent } from "../client";

createRoot(document).render(<ServerComponent url={window.location.pathname} />);
