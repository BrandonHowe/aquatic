import { Component, componentDefaults, ComponentInterface } from "./component";

export class Aquatic extends Component {
    constructor (template: ComponentInterface) {
        super({...{name: "app"}, ...componentDefaults, ...template});
    }

    public static component (template: ComponentInterface, realComponent = true) {
        class ComponentExtension extends Component {
            constructor () {
                super(template, realComponent);
            }
            public static setMountLoc (loc: string) {
                
            }
        }

        return ComponentExtension;
    }

    public mount (id: string) {
        const html = this.renderElement;
        if (html) {
            document.getElementById(id).innerHTML += (html);
        }
    }
}
