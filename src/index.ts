import { Component, componentDefaults, ComponentInterface } from "./component";

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
