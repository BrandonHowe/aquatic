const mustacheRegex = /{{.*}}/g;

interface ComponentInterface {
    template?: string,
    data?: Record<string, any>,
    methods?: Record<string, Function>,
    propArgs?: Record<string, Function>,
    components?: Record<string, Component>
}

const componentDefaults: ComponentInterface = {
    template: "",
    data: {},
    methods: {},
    propArgs: {},
    components: {}
};

class Component {
    private props: Record<string, any> = {};

    constructor (
        private name: string,
        public template: ComponentInterface
    ) {};

    set setTemplate (template: string) {
        this.template.template = template;
    }

    public static filterMustache (str: string) {
        return str.substring(2, str.length - 2).trim();
    }

    public setProp (prop: string, value: any) {
        console.log(`Setting ${prop} to ${value}`);
        console.log(this.template.propArgs[prop]);
        if (this.template.propArgs[prop]) {
            if (value instanceof this.template.propArgs[prop] || this.template.propArgs[prop](value) === value) {
                this.props[prop] = value;
                if (!this.template.propArgs[prop]) {
                    console.error(`[Aqua warn]: The prop ${prop} does not exist on component ${this.name}. If you are passing props in, make sure that they are all defined on the component.`);
                }
            } else {
                console.error(`[Aqua warn]: Prop ${prop} expects a type of ${this.template.propArgs[prop]} but instead received a value of type ${Array.isArray(value) ? "Array" : typeof value}.`);
            }
        } else {
            console.error(`Component ${this.name} does not have property ${prop}, but it was passed in anyways. Make sure you define it in the props section of your component.`)
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
            { acceptNode: function(node: any) {
                    if ( ! /^\s*$/.test(node.data) ) {
                        return NodeFilter.FILTER_ACCEPT
                    }
                }
            }
        );

        let node: any;

        while ((node = nodeIterator.nextNode())) {
            if (node.nodeType === 3) {
                node.data = node.data.replace(mustacheRegex, (match: string): string => {
                    const replaced = Component.filterMustache(match);
                    if (this.template.data[replaced]) {
                        return this.template.data[replaced];
                    } else if (this.props[replaced]) {
                        return this.props[replaced];
                    } else {
                        console.error(`[Aqua warn]: Variable ${replaced} is referenced during render, but is not initialized on component. Make sure that you have declared this variable in the data or props section of your component.`);
                        return undefined;
                    }
                });
            } else {
                const tag = node.tagName;
                console.log(this.template.components);
                for (const attribute of node.attributes) {
                    this.template.components[tag.toLowerCase()].setProp(attribute.nodeName, attribute.nodeValue);
                }
                if (this.template.components[tag.toLowerCase()]) {
                    node.outerHTML = this.template.components[tag.toLowerCase()].renderElement.outerHTML;
                }
            }
        }
        return temp;
    }
}

class Aquatic extends Component {
    constructor (template: ComponentInterface) {
        super("app", {...componentDefaults, ...template});
    }

    public component (name: string, template: ComponentInterface) {
        this.template.components[name] = new Component(name, {...componentDefaults, ...template});
    }

    public mount (id: string) {
        const html = this.renderElement;
        document.getElementById(id).appendChild(html);
    }
}
