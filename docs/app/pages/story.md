# Build your server


## The beginning

Create a `app.config.js` file in the root of your project and add the following:


```ts [app.config.js]
import { createApp } from "vinxi"

export default createApp()
```

## A static file server

A simple web server typically serves static files from a directory on disk. Let's add a `public` directory and serve it's contents:



```ts [app.config.js]
import { createApp } from "vinxi"

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
  ]
})
```



You can already create an `index.html` file in the `public` directory and serve it from the root of your server.


```html [public/index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
```

You have yourself a web app!

Ok, just kidding. There's nothing you can do on the app. Let's add some javascript.

## JavaScript enters the chat

We can add a `app.js` file in the `public` directory and add some javascript to it.



```ts [public/app.js]
console.log("Hello World")
```


We need to add the script to the `index.html` file for the browser to actually fetch that code and execute it.



```html {9} [public/index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <script src="/app.js"></script>
  </body>
</html>
```


 info

Note how we can use `/app.js` to refer to the `/public/app.js` file from the `index.html` file. This is because we have set the `base` to `/` in the router config. This means that all the files in the `public` directory are served at the routes corresponding to their paths excluding the `public` part, `/public/app.js` is served at `/app.js`.

If we had set the `base` to `/static`, then the `/public/app.js` file would be served at `/static/app.js`. But so would the `public/index.html`, and that would be a problem. We will deal with that problem later. But its usually a good idea to set the `base` to `/` for the `static` mode. so that people's expectations are met regarding the routes of the files in the `public` directory.



You can now open the browser console and see the message.



But still, there's nothing you can do on the app. Let's add a button.



```html {9} [public/index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <button id="my-buttton">Click Me</button>
    <script src="/app.js"></script>
  </body>
</html>
```

```ts [public/app.js]
document.getElementById("my-button").addEventListener("click", () => {
  console.log("Hello World")
})
```



We need some javascript to handle the click of the button.



```ts [public/app.js]
document.getElementById("my-button").addEventListener("click", () => {
  console.log("Hello World")
})
```

```html {9} [public/index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello World</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <button id="my-buttton">Click Me</button>
    <script src="/app.js"></script>
  </body>
</html>
```



Okay, this is getting fun. Lets add some styles.



```html {6} [public/index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello World</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <h1>Hello World</h1>
    <button id="my-buttton">Click Me</button>
    <script src="/app.js"></script>
  </body>
</html>
```

```ts [public/app.js]
document.getElementById("my-button").addEventListener("click", () => {
  console.log("Hello World")
})
```





```css [public/app.css]

body {
  background-color: #000;
  color: #fff;
}

```

Ahh, I don't like that background color. Needs more pop. Let's change it to a nice shade of blue.



```css [public/app.css]

body {
  background-color: #0000ff;
  color: #fff;
}

```



Wait the color on the website didn't change. Well that's annoying. Okay, let's refresh the page. There it is. Okay thats better.

I don't know about you, but I want some confetti when I click the button. Let's add a library to do that.

I looked around and found this library called [canvas-confetti]().

Let's install it.



```bash[npm]
npm install canvas-confetti
```

```bash[yarn]
yarn add canvas-confetti
```

```bash[pnpm]
pnpm add canvas-confetti
```



We can now import and use it in our javascript file.



```ts [public/app.js] {1,4}
import confetti from "canvas-confetti"

document.getElementById("my-button").addEventListener("click", () => {
  confetti()
})
```

Let's refresh the page again (I know, I know, it's annoying). Click the button. Erm, nothing happened. Let's check the console. Oh, it says `Cannot use import statement in a script`. We need to tell the browser that we are using ES modules.



```html {6} [public/index.html]
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello World</title>
    <link rel="stylesheet" href="/app.css" />
  </head>
  <body>
    <h1>Hello World</h1>
    <button id="my-buttton">Click Me</button>
    <script type="module" src="/app.js"></script>
  </body>
</html>
```



Refresh. Click. Confe... Aghh. Nothing again. Let's check the console. Oh, it says `Uncaught TypeError: Failed to resolve module specifier "canvas-confetti". Relative references must start with either "/", "./", or "../".`. Hmm. The browser doesn't know where to find canvas-confetti. The browser knows how to handle URL's. Okay, this is tricky.

Let's take a look at some of the core problems we have faced:
- We need to refresh the page every time we make a change to the code. This is frustrating and kills momentum
- We want to be able to just install node-modules and use them in our code. But the browser doesn't know how to handle node-modules.

Before we go down this path, I discovered some other problems faced here:
- I have to declare all my stylesheets in the `index.html` file. Makes it difficult to scope css to components/modules.
- There are some packages that are still in CJS format. The browser doesn't know how to handle that.
- The browser doesn't know about `index.js` or imports without the extension, eg. `import { add } from "./utils"`.
- If I want to write typescript, I need to add a transpile step for the browser to understand it.
- If I want to use React, Vue, etc. I need to add a transpile step for the browser to understand it.

This is just the tip of the iceberg for thr problems faced with working with bare HTML, CSS and JS. We want to write the code this way. But the browser only understands a certain way of doing things. We need to bridge the gap between the two. This is where Vite comes in. It's a tool that bridges the gap between the way we want to write code and the way the browser understands code. It does this by providing a development server runtime that transforms our code to a format the browser understands. It also provides a builder that transforms our code to a production ready format with a lot of optimizations. It also provides a plugin API that allows us to customize the development server and builder.

`vinxi` comes with a built-in Vite development server and builder. Let's use it.

As we have seen before the primitive building block of `vinxi` is a `router`. We have one router that serves static files from the `public` directory. Let's add another router that serves our web app. The entrypoint for our web app is going to be `index.html`. Let's add a router that serves that file. We call this mode where we have one `index.html` file that all routes of the app map to a `spa` mode.



```ts [app.config.js] {12-15}
import { createApp } from "vinxi"

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "app",
      type: "spa",
      file: "./index.html",
      base: "/",
    },
  ]
})
```

We will move the files from the `public` directory to the root of the project. Let's run the dev server again.

All our problems have now been solved. Change something in the CSS. or the JavaScript file. The browser will automatically reload. Install a node-module and use it in your code. The browser will know what to do. Change to typescript, install React, Vue, etc. The browser will know what to do. Because vite tells it.

Okay now that we all this power, lets thing bigger. What if we sent an email when the button is clicked. We can use the `nodemailer` package to do that. Let's install it.



```bash[npm]
npm install nodemailer
```

```bash[yarn]
yarn add nodemailer
```

```bash[pnpm]
pnpm add nodemailer
```



Let's import it and use it in our javascript file.



```ts [app.js] {1,4}
import confetti from "canvas-confetti"
import nodemailer from "nodemailer"

document.getElementById("my-button").addEventListener("click", () => {
  confetti()
  nodemailer.sendMail({
    from: "
  })
})
```


Ohho, the browser is not able to import the nodemailer module. Looks like uses node features that are not available in the browser. Turns out you need to be on the server to send an email this way. Hmm well where do I get a server from. Well, well, well, looks at that. It looks like there was a server there all along. Till now it was using inbuilt handlers to serve static files and the index.html file. But we can add our own handlers to the server. These can be used as API endpoints, or other server functionality. For now, we want to add a handler that sends an email. Let's do that.

The current routers are in modes that vinxi handles for us. But we can also add routers in `handler` mode. This means that we will handle the request ourselves on the server. Let's add a router in `handler` mode that sends an email.



```ts [app.config.js] {18-24}
import { createApp } from "vinxi"

export default createApp({
  routers: [
    {
      name: "public",
      type: "static",
      dir: "./public",
      base: "/",
    },
    {
      name: "app",
      type: "spa",
      handler: "./index.html",
      base: "/",
    },
    {
      name: "send-email",
      type: "http",
      handler: "./api/send-email.ts",
      base: "/api/send-email",
      build: {
        target: 'server'
      }
    }
  ]
})

```



We need to create the `api/send-email.ts` file. Let's do that.



```ts [api/send-email.ts]
import nodemailer from "nodemailer"
import { eventHandler } from "vinxi/http"

export default eventHandler(async (event) => {
  await nodemailer.sendMail({
    from: ""
  })

  return 'done'
})
```



Now we can call the `/api/send-email` endpoint from our javascript file.



```ts [app.js] {1,4}
import confetti from "canvas-confetti"

document.getElementById("my-button").addEventListener("click", () => {
  confetti()
  fetch("/api/send-email", {
    method: "POST"
  })
})
```



Okay we sending emails now!

We can even get information from the client and send it in the email.

Lets send the current time in the email. But not the time on the server, the time on the client when the email request is sent.

<CH.Code>

```ts app.js
import confetti from "canvas-confetti"

document.getElementById("my-button").addEventListener("click", () => {
  confetti()
  fetch("/api/send-email", {
    method: "POST",
    // mark(1:3)
    body: JSON.stringify({
      time: Date.now()
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
})
```

```ts api/send-email.ts {5,8}
import nodemailer from "nodemailer"
import { eventHandler, readBody } from "vinxi/http"

export default eventHandler(async (event) => {
  // mark
  const { time } = await readBody(event)
  await nodemailer.sendMail({
    from: "",
    // mark
    text: `Current time: ${time}`
  })

  return 'done'
})
```

</CH.Code>
