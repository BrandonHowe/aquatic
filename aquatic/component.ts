import {
    elementSupportsAttribute,
    firstElementName,
    mustacheRegex,
    objToCSS,
} from "./helpers";
import { Aquatic } from "./index";

interface ComponentInterface {
    name: string,
    template?: string,
    data?: Record<string, any>,
    methods?: Record<string, Function>,
    propArgs?: Record<string, Function>,
    components?: Record<string, { new (): Component }>
}

const componentDefaults: ComponentInterface = {
    name: "",
    template: "",
    data: {},
    methods: {},
    propArgs: {},
    components: {},
};

class Component {
    private props: Record<string, any> = {};
    private components: Component[][] = [];
    public style: Record<string, any> = {};
    public attributes: Record<string, string> = {};
    public forObj: Record<any, any> | Array<any>;

    public hidden = false;

    constructor (public template: ComponentInterface, private realComponent = true) {
        this.template = {...componentDefaults, ...template};
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
            Object.defineProperty(this, i, {
                value: this.template.data[i],
                writable: true,
            })
        }
    };

    public static filterMustache (str: string) {
        return str.substring(2, str.length - 2).trim();
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

    get renderElement (): string {
        if (!this.realComponent) {
            return null;
        }
        let temp = document.createElement("div");
        if (this.template.template !== null) {
            if (temp.parentElement) {
                temp.outerHTML = this.template.template;
            } else {
                temp.innerHTML = this.template.template;
            }
        }
        const nodeIterator = document.createNodeIterator(
            temp,
            NodeFilter.SHOW_ALL,
            {
                acceptNode: function (node: any) {
                    if (!/^\s*$/.test(node.data)) {
                        return NodeFilter.FILTER_ACCEPT
                    }
                },
            },
        );

        let node: any;

        while ((node = nodeIterator.nextNode())) {
            if (node.nodeType === 3) {
                node.data = node.data.replace(mustacheRegex, (match: string): string => {
                    const replaced = Component.filterMustache(match);
                    return eval(replaced);
                });
            } else {
                const isCustomComponent = Object.keys(this.template.components).includes(node.tagName.toLowerCase());
                const newComponentTemplate: (new () => Component) = isCustomComponent ? this.template.components[node.tagName.toLowerCase()]
                    : Aquatic.component({name: "placeholder", template: node.outerHTML});
                const newComponent: Component[] = [new newComponentTemplate()];
                const hasAFor = !!node.getAttribute("a-for");
                let forObj: Record<string, any>;
                let forTarg: string;
                if (hasAFor) {
                    const attribute = node.getAttribute("a-for");
                    const splitVal = attribute.split("in").map((l: string) => l.trim());
                    if (splitVal.length === 2) {
                        forTarg = splitVal[0];
                        forObj = new Function(`return ${splitVal[1]}`).bind(this)();
                        newComponent.pop();
                        for (const i in forObj) {
                            newComponent.push(new newComponentTemplate());
                        }
                    } else {
                        console.error(`[Aqua warn]: a-for should be of format "idx in this.variables" but the format provided did not match the format required.`)
                    }
                }
                for (const [index, currentComponent] of newComponent.entries()) {
                    if (hasAFor) {
                        Object.defineProperty(this, forTarg, {
                            get () {
                                return Object.values(forObj)[index]
                            },
                            set (newValue) {
                                console.error(`[Aqua warn]: Do not change props.`);
                                this[forTarg] = newValue;
                            },
                            configurable: true
                        });
                    }
                    for (const attribute of node.attributes) {
                        const evaluated = attribute.nodeName.charAt(0) === "$";
                        const name = evaluated ? attribute.nodeName.slice(1) : attribute.nodeName;
                        const value = evaluated ? new Function(`return ${attribute.nodeValue}`).bind(this)() : attribute.nodeValue;
                        switch (name) {
                            case "a-if":
                                currentComponent.hidden = !value;
                                break;
                            case "class":
                                if (evaluated) {
                                    if (Array.isArray(value)) {
                                        for (const classVal of value) {
                                            node.clasList.add(classVal);
                                        }
                                    } else {
                                        for (const i in value) {
                                            if (value[i]) {
                                                node.classList.add(value[i]);
                                            }
                                        }
                                    }
                                } else {
                                    const splitValue = value.split(" ");
                                    for (const i in splitValue) {
                                        if (splitValue[i]) {
                                            node.classList.add(splitValue[i].trim());
                                        }
                                    }
                                }
                                break;
                            case "style":
                                if (evaluated) {
                                    for (const i in value) {
                                        if (value[i]) {
                                            this.style[i] = value[i];
                                        }
                                    }
                                } else {
                                    node.style = value;
                                }
                                break;
                            default:
                                if (name !== "a-for") {
                                    if (elementSupportsAttribute(firstElementName(currentComponent.template.template), name)) {
                                        node.setAttribute(name, value);
                                        if (evaluated) {
                                            node.removeAttribute(`$${name}`);
                                        }
                                    } else {
                                        currentComponent.setProp(name, value);
                                    }
                                }
                                break;
                        }
                    }
                }
                for (const [index, component] of newComponent.entries()) {
                    if (isCustomComponent) {
                        const renderedElement = component.renderElement;
                        if (renderedElement) {
                            const styleObj = objToCSS(this.style);
                            if (styleObj) {
                                node.setAttribute("style", styleObj);
                            }
                            node.innerHTML += renderedElement;
                        }
                        this.components.push(newComponent);
                    }
                }
                if (isCustomComponent && node.parentNode) {
                    node.outerHTML = node.innerHTML;
                }
            }
        }
        if (this.hidden || !this.realComponent) {
            return undefined;
        } else {
            return temp.innerHTML;
        }
    }
}

export { Component, ComponentInterface, componentDefaults }
