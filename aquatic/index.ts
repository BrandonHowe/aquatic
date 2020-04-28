import { Component, componentDefaults, ComponentInterface } from "./component";
import { collapseNodeStyles } from "./helpers";

export class Aquatic extends Component {
    private pastMountLocation: string;

    constructor (template: ComponentInterface) {
        super({...{name: "app"}, ...componentDefaults, ...template});
    }

    public static component (template: ComponentInterface, realComponent = true) {
        class ComponentExtension extends Component {
            constructor () {
                super(template, realComponent);
            }
        }

        return ComponentExtension;
    }

    public mount (id: string = this.pastMountLocation) {
        const html = this.renderElement;
        // const [newHTML, style] = collapseNodeStyles(html);
        if (html) {
            document.getElementById(id).appendChild(html);
        }
    }
}
