import {
    elementSupportsAttribute, filterMustache, isElement,
    mustacheRegex, namedNodeMapToArr,
    objToCSS,
} from "./helpers";
import { Aquatic } from "./index";
import { VirtualDOMNode, VirtualDOMTextNode } from "./vdom";

// This is some code that I used to use before the VDOM. I think it will come in handy. Just don't worry about it.
// get renderElement () {
//     if (!this.realComponent) {
//         return null;
//     }
//     let temp = document.createElement("div");
//     if (this.template.template !== null) {
//         if (temp.parentElement) {
//             temp.outerHTML = this.template.template;
//         } else {
//             temp.innerHTML = this.template.template;
//         }
//     }
//     const nodeIterator = document.createNodeIterator(
//         temp,
//         NodeFilter.SHOW_ALL,
//         {
//             acceptNode: function (node: any) {
//                 if (!/^\s*$/.test(node.data)) {
//                     return NodeFilter.FILTER_ACCEPT
//                 }
//             },
//         },
//     );
//
//     let node: any;
//
//     while ((node = nodeIterator.nextNode())) {
//         if (node.nodeType === 3) {
//             node.data = node.data.replace(mustacheRegex, (match: string): string => {
//                 const replaced = Component.filterMustache(match);
//                 return eval(replaced);
//             });
//         } else {
//             const isCustomComponent = Object.keys(this.template.components).includes(node.tagName.toLowerCase());
//             const newComponentTemplate: (new () => Component) = isCustomComponent ? this.template.components[node.tagName.toLowerCase()]
//                 : Aquatic.component({name: "placeholder", template: node.outerHTML});
//             const newComponent: Component[] = [new newComponentTemplate()];
//             const hasAFor = !!node.getAttribute("a-for");
//             let forObj: Record<string, any>;
//             let forTarg: string;
//             if (hasAFor) {
//                 const attribute = node.getAttribute("a-for");
//                 const splitVal = attribute.split(" in ").map((l: string) => l.trim());
//                 if (splitVal.length === 2) {
//                     forTarg = splitVal[0];
//                     forObj = new Function(`return ${splitVal[1]}`).bind(this)();
//                     newComponent.pop();
//                     for (const i in forObj) {
//                         newComponent.push(new newComponentTemplate());
//                     }
//                 } else {
//                     console.error(`[Aqua warn]: a-for should be of format "idx in this.variables" but the format provided did not match the format required.`)
//                 }
//             }
//             for (const [index, currentComponent] of newComponent.entries()) {
//                 if (hasAFor) {
//                     Object.defineProperty(this, forTarg, {
//                         get () {
//                             return Object.values(forObj)[index]
//                         },
//                         set (newValue) {
//                             console.error(`[Aqua warn]: Do not change props. If you need to, make a data property and set the data property to the prop value, and change that property.`);
//                             this[forTarg] = newValue;
//                         },
//                         configurable: true
//                     });
//                 }
//                 const attributeReplacements: Record<string, string> = {};
//                 for (const attribute of node.attributes) {
//                     const evaluated = attribute.nodeName.charAt(0) === "$";
//                     const isListener = attribute.nodeName.charAt(0) === "@";
//                     const name = evaluated || isListener ? attribute.nodeName.slice(1) : attribute.nodeName;
//                     const value = evaluated || isListener ? new Function(`return ${attribute.nodeValue}`).bind(this)() : attribute.nodeValue;
//                     // console.log(`${isListener}|${name}|${value}`)
//                     if (isListener) {
//                         console.log(`Adding event listener ${name}`, value);
//                         document.addEventListener(name, value.bind(this), false);
//                     } else {
//                         switch (name) {
//                             case "a-if":
//                                 currentComponent.hidden = !value;
//                                 break;
//                             case "class":
//                                 if (evaluated) {
//                                     if (Array.isArray(value)) {
//                                         for (const classVal of value) {
//                                             node.clasList.add(classVal);
//                                         }
//                                     } else {
//                                         for (const i in value) {
//                                             if (value[i]) {
//                                                 node.classList.add(value[i]);
//                                             }
//                                         }
//                                     }
//                                 } else {
//                                     const splitValue = value.split(" ");
//                                     for (const i in splitValue) {
//                                         if (splitValue[i]) {
//                                             node.classList.add(splitValue[i].trim());
//                                         }
//                                     }
//                                 }
//                                 break;
//                             case "style":
//                                 if (evaluated) {
//                                     for (const i in value) {
//                                         if (value[i]) {
//                                             this.style[i] = value[i];
//                                         }
//                                     }
//                                 } else {
//                                     node.style = value;
//                                 }
//                                 break;
//                             case "a-click":
//                                 node.addEventListener("click", new Function(`return ${value}`).bind(this));
//                                 break;
//                             default:
//                                 if (name !== "a-for") {
//                                     if (elementSupportsAttribute(firstElementName(currentComponent.template.template), name)) {
//                                         attributeReplacements[name] = value;
//                                         attributeReplacements[`$${name}`] = undefined;
//                                     } else {
//                                         currentComponent.setProp(name, value);
//                                     }
//                                 }
//                                 break;
//                         }
//                     }
//                 }
//                 for (const [key, value] of Object.entries(attributeReplacements)) {
//                     if (value) {
//                         node.setAttribute(key, value);
//                     } else {
//                         node.removeAttribute(key);
//                     }
//                 }
//             }
//             for (const [index, component] of newComponent.entries()) {
//                 if (isCustomComponent) {
//                     const renderedElement = component.renderElement;
//                     if (renderedElement) {
//                         const styleObj = objToCSS(this.style);
//                         if (styleObj) {
//                             node.setAttribute("style", styleObj);
//                         }
//                         for (const i in renderedElement.childNodes) {
//                             if (renderedElement.childNodes[i] && renderedElement.childNodes[i].nodeName !== undefined) {
//                                 node.append(renderedElement.childNodes[i])
//                             }
//                         }
//                     }
//                     this.components.push(newComponent);
//                 }
//             }
//             if (isCustomComponent && node.parentNode) {
//                 node.outerHTML = node.innerHTML;
//             }
//         }
//     }
//     if (this.hidden || !this.realComponent) {
//         return undefined;
//     } else {
//         return temp;
//     }
// }

interface ComponentInterface {
    name: string,
    template?: string,
    style?: string[],
    data?: Record<string, any>,
    methods?: Record<string, Function>,
    propArgs?: Record<string, Function>,
    components?: Record<string, { new (): Component }>
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
    private props: Record<string, any> = {};
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

    constructor (public template: ComponentInterface, private realComponent = true) {
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
        for (const i in template.data) {
            if (Object.getOwnPropertyDescriptor(this, i)) {
                console.error(`[Aqua warn]: Method ${i} is defined in component ${this.template.name} and will be overwritten by the data value of the same name. Please change the name if you are running into issues.`)
            }
            if (typeof this.template.data[i] !== "object") {
                Object.defineProperty(this, i, {
                    get () {
                        return this.template.data[i];
                    },
                    set (val) {
                        this.template.data[i] = val;
                        if (this.mountLocation) {
                            this.mountLocation.mount();
                        }
                    }
                })
            } else {
                const self = this;
                Object.defineProperty(this, i, {
                    value: new Proxy(this.template.data[i], {
                        get: function(target, property) {
                            // property is index in this case
                            return target[property];
                        },
                        set: function(target, property, value, receiver) {
                            target[property] = value;
                            self.mountLocation.mount();
                            // you have to return true to accept the changes
                            return true;
                        }
                    }),
                    writable: true
                })
            }
        }
    };

    private evaluateAttributes (attributes: Attribute[]) {
        for (let attribute of attributes) {
            const attrType: AttributeType = (() => {
                if (attribute.name.charAt(0) === "$") {
                    return "evaluated";
                } else {
                    return "default";
                }
            })();
            if (attrType === "evaluated") {
                attribute.name = attribute.name.slice(1);
                attribute.value = new Function(`return ${attribute.value}`).bind(this)();
                console.log(`Setting ${attribute.name} to`, attribute.value)
            }
        }
        return attributes;
    }

    private evaluateListeners (attributes: Attribute[]) {
        const listeners: Record<string, Function> = {};
        for (let attribute of attributes) {
            const attrType: AttributeType = (() => {
                if (attribute.name.charAt(0) === "@") {
                    return "evaluated";
                } else {
                    return "default";
                }
            })();
            if (attrType === "evaluated") {
                listeners[attribute.name.slice(1)] = new Function(`return ${attribute.value}`).bind(this);
                attributes.splice(attributes.indexOf(attribute));
            }
        }
        return listeners;
    }

    private parseText (text: string) {
        if (text) {
            return text.replace(mustacheRegex, (match) => new Function(`return ${filterMustache(match)}`).bind(this)())
        } else {
            return "";
        }
    }

    public elementToComponent (node: Node): VirtualDOMNode | VirtualDOMTextNode {
        if (isElement(node)) {
            const name = node.tagName;
            const attributes: Attribute[] = this.evaluateAttributes(namedNodeMapToArr(node.attributes));
            const listeners: Record<string, Function> = this.evaluateListeners(attributes);
            // console.log("Attributes", attributes);
            // console.log("Listeners", listeners);
            const children = node.childNodes;
            const newChildren: (VirtualDOMNode | VirtualDOMTextNode)[] = [];
            for (const i in children) {
                const child = children[i];
                if (typeof children[i] !== "function") {
                    if (child instanceof Element && this.template.components[child.tagName]) {
                        console.log("Component exists!")
                        const newComp = new this.template.components[child.tagName]();
                        newChildren.push(newComp.turnComponentIntoVNode);
                    } else {
                        newChildren.push(this.elementToComponent(children[i]));
                    }
                }
            }
            return new VirtualDOMNode(name, attributes, listeners, newChildren, true);
        } else {
            return new VirtualDOMTextNode(this.parseText(node.textContent));
        }
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

    private setProp (prop: string, value: any) {
        if (this.template.propArgs[prop]) {
            this.props[prop] = value;
            if (Object.getOwnPropertyDescriptor(this, prop)) {
                console.error(`[Aqua warn]: Data or method value ${prop} is defined in component ${this.template.name} and will be overwritten by the prop of the same name. Please change the name if you are running into issues.`)
            }
            Object.defineProperty(this, prop, {
                value: this.props[prop],
            });
            if (value instanceof this.template.propArgs[prop] || this.template.propArgs[prop](value) === value) {
                if (!this.template.propArgs[prop]) {
                    console.error(`[Aqua warn]: The prop ${prop} does not exist on component ${this.template.name}. If you are passing props in, make sure that they are all defined on the component.`);
                }
            } else {
                console.error(`[Aqua warn]: Prop ${prop} in component ${this.template.name} expects a type of ${this.template.propArgs[prop].name} but instead received a value of type ${Array.isArray(value) ? "Array" : typeof value}.`);
            }
        } else {
            console.error(`[Aqua warn]: Component ${this.template.name} does not have property ${prop}, but it was passed in anyways. Make sure you define it in the props section of your component.`)
        }
    }

    get turnComponentIntoVNode (): VirtualDOMNode | VirtualDOMTextNode {
        let temp = document.createElement("div");
        temp.innerHTML = this.template.template;
        return this.elementToComponent(temp);
    }
}

export { Component, ComponentInterface, componentDefaults, Attribute }
