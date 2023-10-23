import { createApp } from "vinxi";

import { devtoolsClientDev } from "./devtools-dev.js";

export default createApp({
	routers: [devtoolsClientDev()],
});
