import { Component } from "./component";
import { elementSupportsAttribute } from "./helpers";

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

class VirtualDOMNode {
    constructor (
        public tagName: string,
        public attributes: Record<string, any>[],
        public listeners: Record<string, Function>,
        public children: (VirtualDOMNode | VirtualDOMTextNode)[],
        public component: Component
    ) {}

    get displayDOM (): Element {
        const myElement = document.createElement(this.tagName);
        for (const i in this.listeners) {
            console.log("Listener! ", i, this.listeners[i]);
            if (i && this.listeners[i]) {
                if (i === "click") {
                    myElement.addEventListener(i, this.listeners[i].bind(this.component));
                } else {
                    console.log(`Setting global listener: ${i}`, this.component, myElement, this.listeners[i]);
                    document.addEventListener(i, this.listeners[i].bind(this.component));
                }
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
