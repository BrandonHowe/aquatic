// @ts-nocheck

import { Aquatic } from "../../../../aquatic/index";

import html from "./index.component.html";
import css from "./index.component.css";
import comp from "../comp/comp.component";

const aq = new Aquatic({
    name: "app",
    template: html,
    style: [css],
    data: {
        myVar: "2",
        vars: []
    },
    methods: {
        addTodoItem (val) {
            this.vars.push(val);
        }
    },
    components: {
        comp
    }
});

export default aq;
