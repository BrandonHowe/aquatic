import {
    elementSupportsAttribute, filterMustache, hasAFor, isElement,
    mustacheRegex, namedNodeMapToArr, objToAttrs,
    objToCSS, removeConstantsFromAttrs,
} from "./helpers";
import { Aquatic } from "./index";
import { VirtualDOMNode, VirtualDOMTextNode } from "./vdom";

interface ComponentInterface {
    name: string,
    template?: string,
    style?: string[],
    data?: Record<string, any>,
    methods?: Record<string, Function>,
    propArgs?: Record<string, Function>,
    components?: Record<string, { new (props?: Attribute[]): Component }>
}

const componentDefaults: ComponentInterface = {
    name: "",
    template: "",
    style: [],
    data: {},
    methods: {},
    propArgs: {},
    components: {},
};

type AttributeType = "default" | "evaluated" | "listener";

interface Attribute {
    name: string,
    value: string
}

class Component {
    protected components: Component[] = [];
    public style: Record<string, any> = {};
    public attributes: Record<string, string> = {};
    public forObj: Record<any, any> | Array<any>;
    protected mountLocation: Aquatic;

    public set setMountLocation (val: Aquatic) {
        this.mountLocation = val;
        for (const component of this.components) {
            component.setMountLocation = val;
        }
    }

    private $emit (name: string, message: any) {
        const event = new CustomEvent(name, {detail: message});
        document.dispatchEvent(event);
    }

    public hidden = false;

    constructor (public template: ComponentInterface, public props: Attribute[] = []) {
        this.template = {...componentDefaults, ...template};
        for (const style of this.template.style) {
            this.template.template += `<style>${style}</style>`
        }
        this.template.name = this.template.name.toLowerCase();
        for (const i in template.methods) {
            Object.defineProperty(this, i, {
                value: this.template.methods[i],
            })
        }
        for (const prop of props) {
            Object.defineProperty(this, prop.name, {
                value: prop.value,
            })
        }
        for (const i in template.data) {
            if (Object.getOwnPropertyDescriptor(this, i)) {
                console.error(`[Aqua warn]: Method ${i} is defined in component ${this.template.name} and will be overwritten by the data value of the same name. Please change the name if you are running into issues.`)
            }
            if (typeof this.template.data[i] === "object") {
                const self = this;
                Object.defineProperty(this, i, {
                    value: new Proxy(this.template.data[i], {
                        get (target, property) {
                            console.log(`Returning ${target} ${property.toString()}`);
                            return target[property];
                        },
                        set (target, property, value, receiver) {
                            target[property] = value;
                            if (self.mountLocation) {
                                self.mountLocation.mount();
                            }
                            return true;
                        },
                    })
                });
            } else {
                Object.defineProperty(this, i, {
                    get () {
                        return this.template.data[i];
                    },
                    set (val) {
                        this.template.data[i] = val;
                        if (this.mountLocation) {
                            this.mountLocation.mount();
                        }
                    },
                })
            }
        }
    };

    private evaluateAttributes (attributes: Attribute[]) {
        return attributes.map(attribute => {
            const attrType: AttributeType = attribute.name.charAt(0) === "$" ? "evaluated" : "default";
            if (attrType === "evaluated") {
                return {
                    name: attribute.name.slice(1),
                    value: new Function(`return ${attribute.value}`).bind(this)(),
                }
            } else {
                return {
                    name: attribute.name,
                    value: attribute.value,
                }
            }
        });
    }

    private evaluateListeners (attributes: Attribute[]) {
        const listeners: Record<string, Function> = {};
        for (let attribute of attributes) {
            const attrType: AttributeType = attribute.name.charAt(0) === "@" ? "listener" : "default";
            if (attrType === "listener") {
                listeners[attribute.name.slice(1)] = new Function(`return ${attribute.value}`).bind(this)();
                attributes.splice(attributes.indexOf(attribute));
            }
        }
        return listeners;
    }

    private parseText (text: string) {
        if (text) {
            return text.replace(mustacheRegex, (match) => new Function(`return ${filterMustache(match)}`).bind(this)());
        } else {
            return "";
        }
    }

    public elementToComponent (node: Node, props: Attribute[] = []): (VirtualDOMNode | VirtualDOMTextNode)[] {
        const isAFor = hasAFor(node, props);
        const forArr: string[] = (() => {
            if (hasAFor(node, props)) {
                const propsIndex = props.findIndex(l => l.name === "a-for");
                if (propsIndex > -1) {
                    return props[propsIndex].value.split(" in ");
                } else {
                    return node.getAttribute("a-for").split(" in ");
                }
            } else {
                return [];
            }
        })();
        const forObj: any[] | Record<string, any> = isAFor ? new Function(`return ${forArr[1]}`).bind(this)() : [null];
        const forIter: string = isAFor ? forArr[0] : "";
        const nodeArr: (VirtualDOMNode | VirtualDOMTextNode)[] = [];
        for (const i in (forObj ? forObj : [])) {
            // @ts-ignore
            let currentFor = forObj[i];
            if (isAFor) {
                Object.defineProperty(this, forIter, {
                    // @ts-ignore
                    value: forObj[i],
                    configurable: true,
                });
            }
            const newProps = this.evaluateAttributes(props);
            newProps.map(l => {
                Object.defineProperty(this, l.name, {
                    get () {
                        return l.value;
                    },
                    set (val) {
                        console.error(`[Aqua warn]: Do not mutate props.`);
                        l.value = val;
                    },
                    configurable: true,
                })
            });
            if (isElement(node)) {
                const name = node.tagName;
                const attributes: Attribute[] = this.evaluateAttributes([...namedNodeMapToArr(node.attributes), ...newProps]);
                const listeners: Record<string, Function> = {...this.evaluateListeners(attributes)};
                for (const attribute of attributes) {
                    if (!elementSupportsAttribute(name, attribute.name) && Object.keys(this.template.propArgs).indexOf(attribute.name) === -1 && removeConstantsFromAttrs([attribute]).length !== 0) {
                        console.error(`[Aqua warn]: Component ${name.toLowerCase()} does not have prop ${attribute.name}, but it was passed in anyways.`)
                    }
                }
                const children = node.childNodes;
                const newChildren: (VirtualDOMNode | VirtualDOMTextNode)[] = [];
                for (const i in children) {
                    const child = children[i];
                    if (typeof children[i] !== "function") {
                        if (child instanceof Element && this.template.components.hasOwnProperty(child.tagName.toLowerCase())) {
                            const newComp = new this.template.components[child.tagName.toLowerCase()](removeConstantsFromAttrs([...attributes, ...objToAttrs({...this.template.data, ...(isAFor ? {forIter: currentFor} : {})})]));
                            newChildren.push(...newComp.turnComponentIntoVNode(child.attributes));
                        } else {
                            newChildren.push(...this.elementToComponent(children[i], removeConstantsFromAttrs(attributes)));
                        }
                    }
                }
                nodeArr.push(new VirtualDOMNode(name, attributes, listeners, newChildren, this));
            } else {
                nodeArr.push(new VirtualDOMTextNode(this.parseText(node.textContent)));
            }
        }
        return nodeArr;
    }

    static nodeToComponent (node: any) {
        const template = node.outerHTML;
        let newComponent = new Component(template);
        let attributes: Record<string, string> = {};
        for (const i in node.attributes) {
            attributes[node.attributes[i].name] = node.attributes[i].value;
        }
        newComponent.attributes = attributes;
        return newComponent;
    }

    protected turnComponentIntoVNode (attributes?: NamedNodeMap, props: Attribute[] = []): (VirtualDOMNode | VirtualDOMTextNode)[] {
        const attrs: Attribute[] = [...props];
        let temp = document.createElement("div");
        temp.innerHTML = this.template.template;
        for (const i in attributes) {
            if (typeof attributes[i] !== "function") {
                if (elementSupportsAttribute("div", attributes[i].nodeName)) {
                    temp.setAttribute(attributes[i].nodeName, attributes[i].nodeValue);
                } else {
                    attrs.push({name: attributes[i].nodeName, value: attributes[i].nodeValue});
                }
            }
        }
        return this.elementToComponent(temp, attrs.filter(l => l.name !== undefined));
    }
}

export { Component, ComponentInterface, componentDefaults, Attribute }
