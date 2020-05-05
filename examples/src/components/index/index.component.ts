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
        vars: [22, 24]
    },
    methods: {
        addTodoItem () {
            console.log("WEW WOOW WOWOWOWOWOWO")
            this.vars.push(this.myVar);
        },
        updateInput (e) {
            console.log(e.target.value);
            this.myVar = e.target.value;
        }
    },
    components: {
        comp
    }
});

export default aq;
