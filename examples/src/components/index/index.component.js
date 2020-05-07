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
        nextid: 1,
        vars: [{val: 22, id: 0}]
    },
    methods: {
        addTodoItem () {
            this.nextid++;
            this.vars.push({val: this.myVar, id: this.nextid++});
        },
        deleteTodoItem (e) {
            console.log("finna delete", this);
            this.vars.splice(this.vars.findIndex(l => l.id === e.target.value));
        },
        updateInput (e) {
            console.log(e.target.value);
            this.myVar = e.target.value;
        }
    },
    listeners: {
        deleteVal (e) {
            this.deleteTodoItem(e.target.value);
        }
    },
    components: {
        comp
    }
});

export default aq;
