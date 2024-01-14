async function getData() {
	"use server";
	console.log(`I have not been blocked.`);
}

export function App() {
	return (
		<div>
			<button onClick={() => getData()} data-test-id="button">
				Get Data
			</button>
		</div>
	);
}
