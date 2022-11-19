import { useEffect, useState } from "react"

export const useAutoRefresh = (interval = 1) => {
  const [_, setVersion] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setVersion((v) => v + 1), interval * 1000)
    return () => clearInterval(id)
  }, [])
}
