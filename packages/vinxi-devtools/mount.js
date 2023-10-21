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
				ref=${ref}
				style=${{
					position: "fixed",
					bottom: "0.5rem",
					left: "50%",
					transform: "translateX(-50%)",
					backgroundColor: "black",
					width: !isOpen ? "4rem" : "60vw",
					borderRadius: isOpen ? "0.5rem" : "40vh",
					height: !isOpen ? "2rem" : "24rem",
					borderColor: "rgba(212,228,254,.191)",
					display: "flex",
					flexDirection: "row",
					overflow: "hidden",
					transition: "all",
					alignItems: "center",
					justifyContent: "center",
					// nice box shadow
					boxShadow: "rgba(99, 99, 99, 0.2) 0px 8px 16px 0px",
				}}
				onClick=${() => {
					setIsOpen((o) => !o);
				}}
			>
				${isOpen
					? html`<iframe
							style=${{ width: "100%", height: "100%", border: "none" }}
							src="/__devtools/client/index.html"
					  />`
					: html`<svg
							xmlns="http://www.w3.org/2000/svg"
							width="1.25rem"
							height="1.25rem"
							viewBox="0 0 24 24"
							style=${{ color: "white" }}
					  >
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1"
								d="M17.684 3.603c.521-.659.03-1.603-.836-1.603h-6.716a1.06 1.06 0 0 0-.909.502l-5.082 8.456c-.401.666.103 1.497.908 1.497h3.429l-3.23 8.065c-.467 1.02.795 1.953 1.643 1.215L20 9.331h-6.849l4.533-5.728Z"
							/>
					  </svg>`}
			</div>`;
		}

		render(html`<${App} />`, shadow.shadowRoot);
	});
}
