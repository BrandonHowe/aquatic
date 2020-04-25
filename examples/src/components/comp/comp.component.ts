import { Aquatic } from "../../../../aquatic/index";

import html from "./comp.component.html";

const comp = Aquatic.component({
    name: "comp",
    template: html,
    propArgs: {
        bruh: String
    }
});

export default comp;
