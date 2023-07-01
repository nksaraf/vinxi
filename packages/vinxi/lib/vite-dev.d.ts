// declare module "vite" {
// 	// interface UserConfig {
// 	// 	router: any;
// 	// }
// }
import { ConfigEnv, UserConfig, Plugin as VitePlugin } from "vite";

export interface Plugin extends VitePlugin {
	config?: (
		this: void,
		config: UserConfig & { router: any },
		env: ConfigEnv,
	) => void | UserConfig | Promise<void | UserConfig>;
}
