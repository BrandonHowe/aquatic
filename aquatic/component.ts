import { mustacheRegex, objToCSS } from "./helpers";

interface ComponentInterface {
    name: string,
    template?: string,
    data?: Record<string, any>,
    methods?: Record<string, Function>,
    propArgs?: Record<string, Function>,
    components?: Record<string, {new (): Component}>
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

    public hidden = false;

    constructor (public template: ComponentInterface) {
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
                writable: true
            })
        }
    };

    public static filterMustache (str: string) {
        return str.substring(2, str.length - 2).trim();
    }

    private setProp (prop: string, value: any) {
        if (this.template.propArgs[prop]) {
            this.props[prop] = value;
            if (Object.getOwnPropertyDescriptor(this, prop)) {
                console.error(`[Aqua warn]: Data or method value ${prop} is defined in component ${this.template.name} and will be overwritten by the prop of the same name. Please change the name if you are running into issues.`)
            }
            Object.defineProperty(this, prop, {
                value: this.props[prop]
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

    get renderElement (): HTMLElement {
        let temp = document.createElement("div");
        if (this.template.template != null) {
            temp.innerHTML = this.template.template;
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
                if (Object.keys(this.template.components).includes(node.tagName.toLowerCase())) {
                    // @ts-ignore
                    const newComponent: Component[] = [new this.template.components[node.tagName.toLowerCase()]()];
                    for (const attribute of node.attributes) {
                        const evaluated = attribute.nodeName.charAt(0) === "$";
                        const name = evaluated ? attribute.nodeName.slice(1) : attribute.nodeName;
                        const value = evaluated ? new Function(`return ${attribute.nodeValue}`).bind(this)() : attribute.nodeValue;
                        switch (name) {
                            case "a-if":
                                newComponent[0].hidden = !value;
                                break;
                            case "a-class":
                                if (evaluated) {
                                    for (const i in value) {
                                        if (value[i]) {
                                            node.classList.add(value[i]);
                                        }
                                    }
                                }
                                break;
                            case "a-style":
                                if (evaluated) {
                                    for (const i in value) {
                                        if (value[i]) {
                                            this.style[i] = value[i];
                                        }
                                    }
                                } else {
                                    console.error(`[Aqua warn]: a-style property must have a binding but was passed in as a raw on component ${newComponent[0].template.name}. Make sure to bind $a-style.`)
                                }
                                break;
                            case "style":
                                break;
                            default:
                                newComponent[0].setProp(name, value);
                                break;
                        }
                    }
                    if (newComponent[0].renderElement) {
                        const renderedElement = newComponent[0].renderElement;
                        renderedElement.setAttribute("style", objToCSS(this.style));
                        node.outerHTML = renderedElement.outerHTML;
                    } else {
                        node.outerHTML = "";
                    }
                    this.components.push(newComponent);
                }
            }
        }
        if (this.hidden) {
            return undefined;
        } else {
            return temp;
        }
    }
}

export { Component, ComponentInterface, componentDefaults }
