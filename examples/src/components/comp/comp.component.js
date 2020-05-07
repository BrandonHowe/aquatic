import { Aquatic } from "../../../../aquatic/index";

import html from "./comp.component.html";
import css from "./comp.component.css";

const comp = Aquatic.component({
    name: "comp",
    template: html,
    style: [css],
    propArgs: {
        bruh: Object
    },
    methods: {
        deleteVal () {
            console.log("deleting");
            this.$emit("deleteval", this.bruh.id);
        }
    }
});

export default comp;
