export default function mount() {
	window.addEventListener("load", async () => {
		const [
			{ default: htm },
			{ Fragment, h, render },
			{ useEffect, useRef, useState },
		] = await Promise.all([
			import("https://esm.sh/htm"),
			import("https://esm.sh/preact"),
			import("https://esm.sh/preact/hooks"),
		]);

		// add a shadow DOM to the document root
		const shadow = document.createElement("div");
		shadow.attachShadow({ mode: "open" });
		shadow.id = "devtools";
		document.body.appendChild(shadow);

		// Initialize htm with Preact
		const html = htm.bind(h);

		function App(props) {
			const [isOpen, setIsOpen] = useState(false);
			const ref = useRef();

			useEffect(() => {
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
			}, [ref.current]);
			return html`<div
				style=${{
					position: "fixed",
					bottom: "0.5rem",
					left: "50%",
					transform: "translateX(-50%)",
				}}
			>
				<div
					ref=${ref}
					style=${{
						position: "absolute",
						bottom: "100%",
						transform: "translateX(-50%)",
						backgroundColor: "rgba(0, 0, 0, 0.90)",
						width: "4rem",
						borderRadius: "100px",
						height: "30px",
						border: "1px solid #3336",
						display: "flex",
						flexDirection: "row",
						transition: "all",
						zIndex: 9999999,
						alignItems: "center",
						justifyContent: "center",
						// nice box shadow
						boxShadow: "rgba(99, 99, 99, 0.2) 0px 8px 16px 0px",
					}}
					onClick=${() => {
						setIsOpen((o) => !o);
					}}
				>
					<svg
						viewBox="0 0 128 128"
						fill="none"
						style=${{ color: "white", width: "16px", height: "16px" }}
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
				${isOpen
					? html`<div
							style=${{
								position: "absolute",
								bottom: "1rem",
								zIndex: 9999998,

								left: "50%",
								transform: "translateX(-50%)",
								backgroundColor: "black",
								width: "70vw",
								borderRadius: "0.5rem",
								height: "45vh",
								border: "1px solid #3336",
								display: "flex",
								flexDirection: "row",
								overflow: "hidden",
								transition: "all",
								alignItems: "center",
								justifyContent: "center",
								// nice box shadow
								boxShadow: "rgba(99, 99, 99, 0.2) 0px 8px 16px 0px",
							}}
					  >
							<iframe
								style=${{
									width: "100%",
									height: "100%",
									border: "none",
								}}
								src="/__devtools/client/index.html"
							/>
					  </div>`
					: null}
			</div>`;
		}

		render(html`<${App} />`, shadow.shadowRoot);
	});
}
