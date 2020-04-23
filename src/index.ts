const mustacheRegex = /{{.*}}/g;

interface Component {
    template?: string,
    data?: Record<string, any>,
    methods?: Record<string, Function>,
    components?: Record<string, Component>
}

class Aquatic {
    private components: Record<string, Component> = {};
    private template: Component = {};

    constructor (template: Component) {
        this.template.template = template.template ? template.template : "";
        this.template.data = template.data ? template.data : {};
        this.template.methods = template.methods ? template.methods : {};
        this.components = template.components ? template.components : {};
    }

    public component (name: string, template: Component) {
        this.components[name.toLowerCase()] = template;
    }

    public static filterMustache (str: string) {
        return str.substring(2, str.length - 2).trim();
    }

    public mount (id: string) {
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
            console.log(node.nodeType);
            if (node.nodeType === 3) {
                node.data = node.data.replace(mustacheRegex, (match: string): string => {
                    const replaced = Aquatic.filterMustache(match);
                    if (this.template.data[replaced]) {
                        return this.template.data[replaced];
                    } else {
                        console.error(`[Aqua warn]: Variable ${replaced} is referenced during render, but is not initialized on component. Make sure that you have declared this variable in the data section of your component.`);
                        return match;
                    }
                });
            } else {
                const tag = node.tagName;
                if (this.components[tag.toLowerCase()]) {
                    node.innerHTML = this.components[tag.toLowerCase()].template;
                }
            }
        }
        document.getElementById(id).appendChild(temp);
    }
}
