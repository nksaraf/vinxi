import {
	FileSystemTree,
	WebContainer as WebContainerCore,
} from "@webcontainer/api";
import React, { Suspense, cache, use } from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import { Link } from "wouter";

const webContainerContext = createContext({
	files: {},
});

const instances: Record<string, WebContainerCore> = {};

const bootWebContainer = cache(async (id: string) => {
	console.log(instances);
	if (instances[id]) {
		return id;
	}
	console.log("Booting web container...");
	console.time("Booted web container");

	const webcontainerInstance = await WebContainerCore.boot();
	instances[id] = webcontainerInstance;
	console.timeEnd("Booted web container");
	return id;
});

const installDependencies = cache(async (id: string) => {
	if (!instances[id]) {
		throw new Error("Web container not booted");
	}

	const container = instances[id];

	const proc = await container.spawn("npm", ["install"]);
	console.log("Installing dependencies...");

	proc.output.pipeTo(new WritableStream({ write: console.log }));
	await proc.exit;
	return id;
});

const runServer = cache(async (id: string) => {
	if (!instances[id]) {
		throw new Error("Web container not booted");
	}

	const container = instances[id];

	const proc = await container.spawn("npm", ["run", "dev"]);
	proc.output.pipeTo(new WritableStream({ write: console.log }));
	return id;
});

function useWebContainerContext() {
	return useContext(webContainerContext);
}

function useContainerInstance(id: string = "default") {
	const container = use(bootWebContainer(id));
	const instance = instances[container];
	return Object.assign(instance, { id });
}

function Counter() {
	const [count, setCount] = React.useState(0);
	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
}

const mountFiles = cache(async (id: string, files: FileSystemTree) => {
	if (!instances[id]) {
		throw new Error("Web container not booted");
	}

	const container = instances[id];

	await container.mount(files);
	return id;
});

function Container({ files }) {
	console.log(files);
	const container = useContainerInstance();
	use(mountFiles(container.id, files));

	use(installDependencies(container.id));

	return <div>Container</div>;
}

const files: FileSystemTree = {
	"index.js": {
		file: {
			contents:
				'import { createApp } from "vinxi"; export default createApp();',
		},
	},
	"package.json": {
		file: {
			contents: JSON.stringify({
				name: "webcontainer",
				version: "0.0.1",
				scripts: {
					dev: "node index.js --dev",
				},
				dependencies: {
					vinxi: "latest",
				},
			}),
		},
	},
};
export default function Hello({ assets }) {
	return (
		<>
			{/* <Suspense fallback={<div>Booting web container...</div>}>
				<Container files={files} />
			</Suspense> */}
			<div>Hellsas\\dasd4</div>
			<Link href="/hello">Hello</Link>
			<Counter />
			{/* <iframe
				src="/_spa/hello"
				style={{
					width: 400,
					height: 300,
				}}
			/>
			<iframe
				src="/hello"
				style={{
					width: 400,
					height: 300,
				}} */}
			{/* /> */}
		</>
	);
}
