import { useLocation } from "react-router-dom";

export function useRouter() {
	return {
		pathname: useLocation().pathname,
	};
}
