import {
	Box,
	Button,
	Container,
	Flex,
	Theme,
	ThemePanel,
} from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "@unocss/reset/tailwind.css";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { use } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import "virtual:uno.css";

import { rpc } from "./rpc.client";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

rpc.add();

document.body.classList.add("dark");

const plugins = [
	{
		id: "routers",
		icon: "i-mdi:routes",
		Component: () => {
			return <div>Routers</div>;
		},
	},
	{
		id: "code",
		icon: "i-carbon:code",
		Component: () => {
			return <div>Routers</div>;
		},
	},
	{
		id: "assets",
		icon: "i-carbon:image-copy",
		Component: () => {
			return (
				<div className="flex-1 p-4 overflow-auto">
					<Input placeholder="Search" type="text" icon="i-carbon-search" />
				</div>
			);
		},
	},
	{
		id: "inspect",
		icon: "i-carbon:stethoscope",
		Component: () => {
			return (
				<div className="flex-1">
					<iframe className="w-full h-full" src="/__inspect" />
				</div>
			);
		},
	},
];

const buttonVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
				outline:
					"border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
				ghost: "hover:bg-sky3 hover:text-sky3-fg",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-auto py-2 rounded-md px-2 text-xs",
				lg: "h-10 rounded-md px-8",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Devtools() {
	return (
		<Theme appearance="dark">
			<div className="h-screen w-full flex flex-col bg-sky1 font-sans n-panel-grids">
				{/* <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
					<h1 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
						DevTools
					</h1>
				</div> */}
				<div className="flex flex-1 overflow-hidden">
					<div className="border-r n-border-base text-sky1-fg w-12 flex flex-col gap-1 items-center py-1 n-bg-base">
						<div className="py-1 border-b n-border-base w-full flex items-center justify-center">
							<NavLink
								className={({ isActive }) =>
									buttonVariants({
										variant: "ghost",
										size: "sm",
										className: isActive ? "text-sky8" : null,
									})
								}
								to={`/index.html`}
							>
								<VinxiLogo />
							</NavLink>
						</div>

						{plugins.map((plugin) => (
							<NavLink
								className={({ isActive }) =>
									buttonVariants({
										variant: "ghost",
										size: "sm",
										className: isActive ? "text-sky8" : null,
									})
								}
								to={`/${plugin.id}`}
							>
								<span className={cn(plugin.icon, "text-lg")} />
							</NavLink>
						))}
					</div>
					<Routes>
						<Route
							path="/index.html"
							element={
								<div className="flex-1 p-4 overflow-auto">
									<Input
										placeholder="Route"
										defaultValue="/"
										type="text"
										icon="i-carbon-direction-right-01 scale-y--100"
									/>
								</div>
							}
						/>
						{plugins.map((plugin) => (
							<Route path={`/${plugin.id}`} element={<plugin.Component />} />
						))}
					</Routes>
				</div>
			</div>
		</Theme>
	);
}

function VinxiLogo({ className = "", ...props }) {
	return (
		<svg
			className={cn("w-4 h-4", className)}
			viewBox="0 0 128 128"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clip-path="url(#clip0_1_9)">
				<path
					d="M93.0704 3.61125L25.7606 54.3447L25 58.9291L25.7606 60.1516L27.2817 62.291L30.7042 64.4303L35.6479 66.5697L40.2113 68.4034L44.0141 71.154L46.2958 74.5159L47.0563 77.2665V81.5452L34.507 124.333V126.472L35.2676 127.694L36.4085 128L38.6901 127.389L104.479 77.2665L106 75.1271V72.3765L105.239 70.2372L103.338 68.4034L89.6479 61.9853L86.2254 58.9291L83.5634 54.3447V49.4548L96.1127 6.97311V3.30562L94.9718 3L93.0704 3.61125Z"
					fill="currentColor"
					stroke="currentColor"
				/>
			</g>
			<defs>
				<clipPath id="clip0_1_9">
					<rect width="128" height="128" fill="currentColor" />
				</clipPath>
			</defs>
		</svg>
	);
}

function Input({ icon, ...props }) {
	return (
		<div className="n-text-input flex flex items-center border n-border-base rounded py-1 pl-1 pr-2 focus-within:n-focus-base focus-within:border-context n-bg-base px-5 py-2 n-primary">
			<div
				className={cn("n-icon ml-0.3em mr-0.1em text-1.1em op50", icon)}
			></div>
			<input
				className="ml-0.4em w-full flex-auto font-bold n-bg-base !outline-none text-base"
				{...props}
			/>
		</div>
	);
}

createRoot(document.getElementById("devtools")).render(
	<BrowserRouter basename="/__devtools/client">
		<Devtools />
	</BrowserRouter>,
);
