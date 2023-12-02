import { createEffect, createSignal } from "solid-js";
import { render } from "solid-js/web";

import style from "./style.css?raw";

export default async function mount() {
	// add a shadow DOM to the document root
	const shadow = document.createElement("div");
	shadow.attachShadow({ mode: "open" });
	shadow.id = "devtools";
	document.body.appendChild(shadow);

	// const NuxtDevtools = ({ client }) => {
	// 	const [panelMargins, setPanelMargins] = useState({
	// 		left: 10,
	// 		top: 10,
	// 		right: 10,
	// 		bottom: 10,
	// 	});
	// 	const [isSafari, setIsSafari] = useState(false);
	// 	const [isInit, setIsInit] = useState(true);
	// 	const [isDragging, setIsDragging] = useState(false);

	// 	// Add other state variables and logic...

	// 	const frameBox = useRef(null);
	// 	const panelEl = useRef(null);
	// 	const anchorEl = useRef(null);

	// 	useEffect(() => {
	// 		if (state.value.open) setIsInit(false);

	// 		// Add other useEffect logic...

	// 		return () => {
	// 			// Cleanup (equivalent to Vue's beforeDestroy)
	// 		};
	// 	}, [state.value.open]); // Dependencies...

	// 	const onPointerDown = (e) => {
	// 		setIsDragging(true);
	// 		// Other logic...
	// 	};

	// 	const bringUp = () => {
	// 		// Logic for bringUp function...
	// 	};

	// 	return (
	// 		<div
	// 			id="nuxt-devtools-anchor"
	// 			ref={anchorEl}
	// 			style={
	// 				{
	// 					/* add styles here... */
	// 				}
	// 			}
	// 			className={`your-classnames ${isDragging ? "another-class" : ""}`}
	// 			onMouseMove={bringUp}
	// 		>
	// 			<div
	// 				className={`nuxt-devtools-glowing ${
	// 					isDragging ? "opacity-class" : ""
	// 				}`}
	// 			/>
	// 			<div
	// 				ref={panelEl}
	// 				className="nuxt-devtools-panel"
	// 				style={
	// 					{
	// 						/* add styles here... */
	// 					}
	// 				}
	// 				onPointerDown={onPointerDown}
	// 			>
	// 				<button
	// 					className="nuxt-devtools-icon-button nuxt-devtools-nuxt-button"
	// 					title="Toggle Nuxt DevTools"
	// 					onClick={client.devtools.toggle}
	// 				>
	// 					<svg
	// 						viewBox="0 0 324 324"
	// 						fill="none"
	// 						xmlns="http://www.w3.org/2000/svg"
	// 						style={
	// 							{
	// 								/* add styles here... */
	// 							}
	// 						}
	// 					>
	// 						{/* SVG content... */}
	// 					</svg>
	// 				</button>
	// 			</div>
	// 		</div>
	// 	);
	// };

	function App(props) {
		const [isOpen, setIsOpen] = createSignal(true);
		let ref;
		const [isHovering, setIsHovering] = createSignal(false);
		createEffect(() => {
			// autoAnimate(ref.current, (el, action, oldCoords, newCoords) => {
			// 	console.log(action);
			// 	let keyframes;
			// 	// supply a different set of keyframes for each action
			// 	if (action === "add") {
			// 		keyframes = [
			// 			{ transform: "scale(0)", opacity: 0 },
			// 			{ transform: "scale(1.15)", opacity: 1, offset: 0.75 },
			// 			{ transform: "scale(1)", opacity: 1 },
			// 		];
			// 	}
			// 	// keyframes can have as many "steps" as you prefer
			// 	// and you can use the 'offset' key to tune the timing
			// 	if (action === "remove") {
			// 		keyframes = [
			// 			{ transform: "scale(1)", opacity: 1 },
			// 			{ transform: "scale(1.15)", opacity: 1, offset: 0.33 },
			// 			{ transform: "scale(0.75)", opacity: 0.1, offset: 0.5 },
			// 			{ transform: "scale(0.5)", opacity: 0 },
			// 		];
			// 	}
			// 	if (action === "remain") {
			// 		// for items that remain, calculate the delta
			// 		// from their old position to their new position
			// 		const deltaX = oldCoords.left - newCoords.left;
			// 		const deltaY = oldCoords.top - newCoords.top;
			// 		// use the getTransitionSizes() helper function to
			// 		// get the old and new widths of the elements
			// 		const [widthFrom, widthTo, heightFrom, heightTo] = getTransitionSizes(
			// 			el,
			// 			oldCoords,
			// 			newCoords,
			// 		);
			// 		// set up our steps with our positioning keyframes
			// 		const start = { transform: `translate(${deltaX}px, ${deltaY}px)` };
			// 		const mid = {
			// 			transform: `translate(${deltaX * -0.15}px, ${deltaY * -0.15}px)`,
			// 			offset: 0.75,
			// 		};
			// 		const end = { transform: `translate(0, 0)` };
			// 		// if the dimensions changed, animate them too.
			// 		if (widthFrom !== widthTo) {
			// 			start.width = `${widthFrom}px`;
			// 			mid.width = `${
			// 				widthFrom >= widthTo ? widthTo / 1.05 : widthTo * 1.05
			// 			}px`;
			// 			end.width = `${widthTo}px`;
			// 		}
			// 		if (heightFrom !== heightTo) {
			// 			start.height = `${heightFrom}px`;
			// 			mid.height = `${
			// 				heightFrom >= heightTo ? heightTo / 1.05 : heightTo * 1.05
			// 			}px`;
			// 			end.height = `${heightTo}px`;
			// 		}
			// 		keyframes = [start, mid, end];
			// 	}
			// 	// return our KeyframeEffect() and pass
			// 	// it the chosen keyframes.
			// 	return new KeyframeEffect(el, keyframes, {
			// 		duration: 600,
			// 		easing: "ease-out",
			// 	});
			// });
			// autoAnimate(ref.current);
		});
		return (
			<>
				<style>{style}</style>
				<div
					id="nuxt-devtools-anchor"
					// className={!isHovering ? "nuxt-devtools-hide" : ""}
					style={{
						left: "50%",
					}}
					onMouseMove={() => {
						setIsHovering(true);
					}}
				>
					<div class="nuxt-devtools-glowing" />
					<div
						ref={ref}
						className="nuxt-devtools-panel"
						style={{
							backgroundColor: "rgba(0, 0, 0, 0.90)",
							width: "4rem",
							height: "30px",
							display: "flex",
							flexDirection: "row",
							transition: "all",
							zIndex: 9999999,
							alignItems: "center",
							justifyContent: "center",
							// nice box shadow
						}}
						onClick={() => {
							setIsOpen((o) => !o);
						}}
					>
						<svg
							viewBox="0 0 128 128"
							fill="none"
							style={{ color: "white", width: "16px", height: "16px" }}
							xmlns="http://www.w3.org/2000/svg"
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
					</div>
					{isOpen() ? (
						<div
							class="nuxt-devtools-frame"
							style={{
								position: "absolute",
								bottom: "1rem",
								left: "0px",
								"z-index": 9999998,
								transform: "translate(-50%, 0)",
								"background-color": "black",
								width: "70vw",
								"border-radius": "0.5rem",
								height: "45vh",
								border: "1px solid #3336",
								display: "flex",
								"flex-direction": "row",
								overflow: "hidden",
								transition: "all",
								"align-items": "center",
								"justify-content": "center",
								// nice box shadow
								"box-shadow": "rgba(99, 99, 99, 0.2) 0px 8px 16px 0px",
							}}
						>
							<iframe src="/__devtools/client/index.html" />
						</div>
					) : null}
				</div>
			</>
		);
	}

	render(() => <App />, shadow.shadowRoot);
}
