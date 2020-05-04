import { Attribute, Component, componentDefaults, ComponentInterface } from "./component";

export class Aquatic extends Component {
    private pastMountLocation: string;

    constructor (template: ComponentInterface) {
        super({...{name: "app"}, ...componentDefaults, ...template});
    }

    public static component (template: ComponentInterface) {
        class ComponentExtension extends Component {
            constructor (props: Attribute[] = []) {
                super(template, props);
            }
        }

        return ComponentExtension;
    }

    public mount (id: string = this.pastMountLocation) {
        console.log("Display: ", this.turnComponentIntoVNode());
        const leDom = this.turnComponentIntoVNode();
        for (const element of leDom) {
            document.getElementById(id).append(element.displayDOM);
        }
        this.mountLocation = this;
        for (const component of this.components) {
            component.setMountLocation = this;
        }
        this.pastMountLocation = id;
    }
}
