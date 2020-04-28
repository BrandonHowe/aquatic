import { Component, componentDefaults, ComponentInterface } from "./component";
import { collapseNodeStyles } from "./helpers";

export class Aquatic extends Component {
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

    public mount (id: string) {
        const html = this.renderElement;
        const [newHTML, style] = collapseNodeStyles(html);
        console.log("New html: ", newHTML);
        if (html) {
            document.getElementById(id).innerHTML += newHTML + style;
        }
    }
}
