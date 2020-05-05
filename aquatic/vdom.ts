import { Component } from "./component";

class VirtualDOMTextNode {
    constructor (public template: string) {
        if (template === undefined) {
            this.template = "";
        }
    }

    get displayDOM () {
        return document.createTextNode(this.template);
    }
}

type AttributeType = "default" | "listener";

class VirtualDOMNode {
    constructor (
        public tagName: string,
        public attributes: Record<string, any>[],
        public listeners: Record<string, any>,
        public children: (VirtualDOMNode | VirtualDOMTextNode)[],
        public component: Component,
    ) {}

    get displayDOM (): Element {
        const myElement = document.createElement(this.tagName);
        for (const attribute of this.attributes) {
            myElement.setAttribute(attribute.name, attribute.value);
        }
        for (const i in this.listeners) {
            if (i && this.listeners[i]) {
                console.log("Setting listener", myElement, i, this.listeners[i]);
                myElement.addEventListener(i, this.listeners[i].bind(this.component));
            }
        }
        this.children.map(l => {
            if (l) {
                myElement.append(l.displayDOM)
            }
        });
        return myElement;
    }
}

export { VirtualDOMNode, VirtualDOMTextNode }
