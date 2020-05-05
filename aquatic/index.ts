import { Attribute, Component, componentDefaults, ComponentInterface } from "./component";
import { updateDOM } from "./diff";

export class Aquatic extends Component {
    private pastMountLocation: string;
    private pastDom: Node;

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
        const newEle = document.createElement("div");
        leDom.map(l => newEle.appendChild(l.displayDOM));
        updateDOM(document.getElementById(id), newEle, this.pastDom);
        this.pastDom = document.getElementById(id).childNodes[0];
        this.mountLocation = this;
        for (const component of this.components) {
            component.setMountLocation = this;
        }
        this.pastMountLocation = id;
    }
}
