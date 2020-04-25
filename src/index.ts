import { Component, componentDefaults, ComponentInterface } from "./component";

export class Aquatic extends Component {
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
        if (html) {
            document.getElementById(id).appendChild(html);
        }
    }
}
