const mustacheRegex = /{{.*}}/g;

interface ComponentInterface {
    name: string,
    template?: string,
    data?: Record<string, any>,
    methods?: Record<string, Function>,
    propArgs?: Record<string, Function>,
    components?: Record<string, Component>
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
    private components: Component[][];
    private mountComponent: Aquatic;

    public hidden = false;

    set setMount (val: Aquatic) {
        this.mountComponent = val;
    }

    constructor (public template: ComponentInterface) {
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
                    const newComponent = [new this.template.components[node.tagName.toLowerCase()]()];
                    for (const attribute of node.attributes) {
                        const evaluated = attribute.nodeName.charAt(0) === "$";
                        const name = evaluated ? attribute.nodeName.slice(1) : attribute.nodeName;
                        const value = evaluated ? eval(attribute.nodeValue) : attribute.nodeValue;
                        switch (name) {
                            case "a-if":
                                console.log(`${this.template.name} Hidden: ${!value}`);
                                newComponent[0].hidden = !value;
                                break;
                            default:
                                newComponent[0].setProp(name, value);
                                break;
                        }
                    }
                    console.log(newComponent[0].renderElement);
                    console.log(temp);
                    if (newComponent[0].renderElement) {
                        console.log("true");
                        node.outerHTML = newComponent[0].renderElement.outerHTML;
                    } else {
                        node.outerHTML = "";
                    }
                }
            }
        }
        console.log(`${this.template.name}|${this.hidden}`);
        console.log(temp);
        if (this.hidden) {
            return undefined;
        } else {
            return temp;
        }
    }
}

class Aquatic extends Component {
    constructor (template: ComponentInterface) {
        super({...{name: "app"}, ...componentDefaults, ...template});
        for (const i in template.components) {
            const component = template.components[i];
            component.setMount = this;
        }
    }

    public static component (template: ComponentInterface) {
        class newClass extends Component {
            constructor () {
                super({...componentDefaults, ...template});
            }
        }

        return newClass;
    }

    public mount (id: string) {
        const html = this.renderElement;
        console.log(html);
        if (html) {
            document.getElementById(id).appendChild(html);
        }
    }
}
