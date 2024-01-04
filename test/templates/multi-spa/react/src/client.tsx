/// <reference types="vinxi/types/client" />
import ReactDOM from "react-dom/client";
import { Counter } from "./Counter";
import { useRef } from "react";
import logo from "./images/logo.png";

function App() {
    const assetImage = useRef<HTMLImageElement>();
    const publicImage = useRef<HTMLImageElement>();
    const markLoaded = (el: HTMLImageElement) => { el.dataset.loaded = "true"; }
    return (
        <>
            <div>
                <img data-test-id="asset-image-react" ref={assetImage} src={logo} onLoad={() => markLoaded(assetImage.current)} />
                <img data-test-id="public-image-react" ref={publicImage} src="/react/favicon.ico" onLoad={() => markLoaded(publicImage.current)} />
            </div>
            <Counter/>
        </>
    );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<App />);
