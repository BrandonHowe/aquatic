"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("./component");
class Aquatic extends component_1.Component {
    constructor(template) {
        super("app", { ...component_1.componentDefaults, ...template });
    }
    component(name, template) {
        this.template.components[name] = new component_1.Component(name, { ...component_1.componentDefaults, ...template });
    }
    mount(id) {
        const html = this.renderElement;
        document.getElementById(id).appendChild(html);
    }
}
