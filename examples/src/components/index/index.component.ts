import { Aquatic } from "../../../../aquatic/index";

import html from "./index.component.html";
import comp from "../comp/comp.component";

const aq = new Aquatic({
    name: "app",
    template: html,
    data: {
        myVar: "22"
    },
    methods: {
        calculate (): any {
            return this.myVar;
        }
    },
    components: {
        comp
    }
});

export default aq;
