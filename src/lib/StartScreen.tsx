import React from "react"
import { styled } from "@stitches/react"
import * as THREE from "three"

export type StartScreenProps = {
  children?: React.ReactNode
}

export const StartScreen = ({ children }: StartScreenProps) => {
  const [started, setStarted] = React.useState(true)

  if (started) {
    return <>{children}</>
  }

  return (
    <Screen>
      <Button
        onClick={() => {
          /* Make sure audio context is resumed within click event, for Safari */
          THREE.AudioContext.getContext().resume()

          /* Start application */
          setStarted(true)
        }}
      >
        START
      </Button>
    </Screen>
  )
}

const Screen = styled("div", {
  fontFamily: "Helvetica Neue",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "black",
  color: "white",
  fontSize: "2rem",
  fontWeight: "bold",
  textTransform: "uppercase"
})

const Button = styled("button", {
  border: "none",
  borderRadius: "0.5rem",
  font: "inherit",
  backgroundColor: "white",
  color: "black",
  padding: "2rem 5rem",
  textTransform: "uppercase",
  cursor: "pointer"
})
