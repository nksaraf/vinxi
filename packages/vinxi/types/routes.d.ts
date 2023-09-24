declare type Mod = `$${string}`;

export type RouteModule = {
	path: string;
} & Record<
	Mod,
	{
		src: string;
		import: () => Promise<any>;
		require: () => any;
	}
>;

declare const routes: RouteModule[];

export default routes;
