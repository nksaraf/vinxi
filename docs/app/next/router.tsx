import { usePathname } from "wouter/use-location";

export { useRouter as useWouter } from "wouter";

export function useRouter() {
	return {
		pathname: usePathname(),
	};
}
