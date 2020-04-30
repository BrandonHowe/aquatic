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
        public custom = false,
    ) {}

    get displayDOM (): Element {
        const myElement = document.createElement(this.tagName);
        console.log(this.attributes);
        for (const attribute of this.attributes) {
            myElement.setAttribute(attribute.name, attribute.value);
        }
        for (const i in this.listeners) {
            myElement.addEventListener(i, this.listeners[i]);
        }
        this.children.map(l => {
            myElement.append(l.displayDOM)
        });
        return myElement;
    }
}

const appVDom = new VirtualDOMNode("app", [], {}, []);

export { VirtualDOMNode, VirtualDOMTextNode }
