import { Component, componentDefaults, ComponentInterface } from "./component";

export class Aquatic extends Component {
    constructor (template: ComponentInterface) {
        super({...{name: "app"}, ...componentDefaults, ...template});
    }

    public static component (template: ComponentInterface) {
        class ComponentExtension extends Component {
            constructor () {
                super(template);
            }
        }

        return ComponentExtension;
    }

    public mount (id: string) {
        const html = this.renderElement;
        if (html) {
            document.getElementById(id).appendChild(html);
        }
    }
}
