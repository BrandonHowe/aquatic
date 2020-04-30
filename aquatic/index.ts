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
        console.log("Display: ", this.turnComponentIntoVNode)
        document.getElementById(id).append(this.turnComponentIntoVNode.displayDOM);
        this.mountLocation = this;
        for (const component of this.components) {
            component.setMountLocation = this;
        }
        this.pastMountLocation = id;
    }
}
