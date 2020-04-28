import { Aquatic } from "../../../../aquatic/index";

import html from "./index.component.html";
import css from "./index.component.css";
import comp from "../comp/comp.component";

const aq = new Aquatic({
    name: "app",
    template: html,
    style: [css],
    data: {
        myVar: "22",
        vars: [1, 4, 8]
    },
    methods: {
        calculate (): any {
            return this.myVar;
        },
        alertStuff (word: string): void {
            alert(word);
        }
    },
    components: {
        comp
    }
});

export default aq;
