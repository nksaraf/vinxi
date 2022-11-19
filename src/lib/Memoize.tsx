import { memo, ReactNode } from "react"

export const Memoize = memo(
  (props: { children?: ReactNode }) => <>{props.children}</>,
  () => true
)
