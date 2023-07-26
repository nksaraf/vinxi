import { useParams, useRouteData } from "@solidjs/router";

export function routeData() {
	const params = useParams();
	return {
		title: params,
	};
}

export default function Page() {
	const params = useParams();
	const data = useRouteData();
	console.log(data);
	return (
		<div>
			Page!! {params.id} {JSON.stringify(data)}
		</div>
	);
}
