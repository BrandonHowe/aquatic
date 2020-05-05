import { VirtualDOMNode, VirtualDOMTextNode } from "./vdom";

type AttributesUpdater = {
    set: { [_: string]: string | number | boolean }
    delete: string[]
}
type VDOMUpdater = {
    type: "replace" | "insert",
    newNode: VirtualDOMNode | VirtualDOMTextNode
} | {
    type: "delete"
} | {
    type: "skip"
}

type VDTUpdaterInfinite = (VDOMUpdater | VDTUpdaterInfinite)[]

const createDiff = (oldNode: VirtualDOMNode | VirtualDOMTextNode, newNode: VirtualDOMNode | VirtualDOMTextNode): VDOMUpdater | VDTUpdaterInfinite => {
    if (!newNode) {
        return {
            type: "delete"
        }
    }
    if (!oldNode) {
        return {
            type: "insert",
            newNode: newNode
        }
    }
    if (oldNode instanceof VirtualDOMTextNode && newNode instanceof VirtualDOMTextNode) {
        if (oldNode.template === newNode.template) {
            return {
                type: "skip"
            }
        } else {
            return {
                type: "replace",
                newNode: newNode
            }
        }
    } else if (oldNode instanceof VirtualDOMTextNode || newNode instanceof VirtualDOMTextNode) {
        return {
            type: "replace",
            newNode: newNode
        }
    } else {
        const longerNode = oldNode.children.length > newNode.children.length ? oldNode : newNode;
        const shorterNode = oldNode.children.length < newNode.children.length ? oldNode : newNode;
        return longerNode.children.map((l, idx) => {
            return createDiff(l, shorterNode.children[idx]);
        })
    }
};

const changed = (node1: Node, node2: Node) => {
    if (node1.nodeType === 1 && node2.nodeType === 1) {
        return node1.textContent !== node2.textContent;
    } else {
        return true;
    }
};

const updateDOM = (parent: Node, newNode: Node, oldNode: Node, index = 0) => {
    console.log("Received", parent, newNode, oldNode);
    if (!newNode) {
        console.log("Removing", parent);
        parent.removeChild(parent.childNodes[index]);
    } else if (!oldNode) {
        console.log("Appending");
        parent.appendChild(newNode);
    } else if (changed(newNode, oldNode)) {
        console.log("It changed!");
        parent.replaceChild(newNode, parent.childNodes[index]);
    } else {
        console.log("they are the same")
        if (newNode.nodeType === 1 && oldNode.nodeType === 1 && newNode instanceof HTMLElement && oldNode instanceof HTMLElement) {
            const newLength = newNode.children.length;
            const oldLength = oldNode.children.length;
            console.log("Children", newNode.childNodes, oldNode.children);
            for (let i = 0; i < newLength || i < oldLength; i++) {
                updateDOM(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
            }
        }
    }
};

export { updateDOM }
