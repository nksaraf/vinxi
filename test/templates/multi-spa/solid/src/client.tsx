import { createSignal } from "solid-js";
import { render } from "solid-js/web";
import { Counter } from "./Counter";
import logo from "./images/logo.png";

function App() {
    const [assetImage, setAssetImage] = createSignal<HTMLImageElement>();
    const [publicImage, setPublicImage] = createSignal<HTMLImageElement>();
    const markLoaded = (el: HTMLImageElement) => { el.dataset.loaded = "true"; }
    return (
        <>
            <div>
                <img data-test-id="asset-image-solid" ref={setAssetImage} src={logo} onLoad={() => markLoaded(assetImage())} />
                <img data-test-id="public-image-solid" ref={setPublicImage} src="/solid/logo.png" onLoad={() => markLoaded(publicImage())} />
            </div>
            <Counter/>
        </>
    );
}

render(() => <App />, document.getElementById("root"));
