import { StartServer, createHandler } from "@vinxi/solid-start/entry-server";

export default createHandler((context) => <StartServer context={context} />);
