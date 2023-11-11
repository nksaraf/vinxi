import createWebSocketCanvas from "../shared/websocket-canvas";
import { useEffect, useRef, useState } from "react";

export default function WebSocketCanvas() {
  const [connected, setConnected] = useState(false);
  const [counter, setCounter] = useState(0);
  const canvas = useRef<HTMLCanvasElement>();

  const [webSocketCanvas] = useState(() => createWebSocketCanvas({
    url: `ws://${window.location.host}/ws`,
    onConnected: () => setConnected(true),
    onDisconnected: () => setConnected(false),
    onCounterUpdate: setCounter
  })); 

  const [color, setColor] = useState<string>(webSocketCanvas.randomColor());

  useEffect(() => {
    webSocketCanvas.fetchCounter().then(value => setCounter(value));
    return webSocketCanvas.cleanup;
  }, []);
  useEffect(() => webSocketCanvas.setCanvas(canvas.current), [canvas]);
  useEffect(() => webSocketCanvas.setColor(color), [color]);

  return (
    <div style={{marginLeft: "auto", marginRight: "auto", maxWidth: "400px"}}>
      <div>
        <b>ws + WebSocket</b>
        { connected ? "💚 Connected" : "💔 Disconnected" }
      </div>
      <button onClick={() => webSocketCanvas.incrementCounter()}>Increment: { counter }</button>
      <div>
        <select onChange={(e) => setColor(e.currentTarget.value)} value={color}>
          {webSocketCanvas.colors.map((color, index) =>
            <option key={index} value={color}>{color}</option>
          )}
        </select>
      </div>
      <canvas ref={canvas} style={{ border: "1px solid black" }} />
    </div>
  )
}
