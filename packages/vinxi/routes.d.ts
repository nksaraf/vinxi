declare type Mod = `$${string}`;

declare const routes: ({
	path: string;
} & Record<
	Mod,
	{
		src: string;
		import: () => Promise<any>;
		require: () => any;
	}
>)[];

export default routes;
