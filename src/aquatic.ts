// @ts-nocheck

import { Aquatic } from "./index";

const comp = Aquatic.component({
    name: "comp",
    template: `
            <p>Component! {{ this.bruh }}</p>
        `,
    propArgs: {
        bruh: String
    }
});
const aq = new Aquatic({
    template: `
            <div>
                <p>My variable: {{ this.myVar + 1 }}</p>
                <div>
                    <h2>Header</h2>
                </div>
                <comp $a-if="this.myVar == 22" bruh="5"></comp>
                <comp bruh="6"></comp>
                <comp $bruh="this.calculate()"></comp>
                <comp $bruh="this.myVar"></comp>
            </div>`,
    data: {
        myVar: "21"
    },
    methods: {
        calculate () {
            this.myVar = "5";
            return this.myVar;
        }
    },
    components: {
        comp
    }
});
console.log("Mounting");
aq.mount("app");
