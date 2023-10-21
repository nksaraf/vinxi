import { createApp } from "vinxi";

import { devtoolsClientDev, devtoolsServer } from "./index.js";

export default createApp({
	routers: [devtoolsClientDev(), devtoolsServer()],
});
