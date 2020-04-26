# Aquatic

Aquatic is an easy and progressive framework designed for rapid development and prototyping. It is designed to stand on its own, or to be incorporated with other frameworks. It's a blend of Vue and Angular and was designed for a coding challenge.

## Declarative Rendering

At the core of Aquatic is a system that enables us to declaratively render to the DOM using straightforward components.

```html
<div id="app">{{ myMessage }}</div>
```

```js
const aq = new Aquatic({
    name: "app",
    data: {
        myMessage: "Hello World from Aquatic!"
    }
});

aq.mount("app");
```

```
Hello World from Aquatic!
```

Wow! You've just made your own Aquatic app! It looks like nothing more than a mustacher, but there's more work being done under the hood. Unfortunately, there's no reactivity yet.

We no longer have to interact with the HTML. An Aquatic element mounts itself onto an element and then controls it. The HTML is the entry point, but everything else happens in the newly created Aquatic instance.
