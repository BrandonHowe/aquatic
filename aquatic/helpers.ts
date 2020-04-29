const mustacheRegex = /{{.*}}/g;

const objToCSS = (obj: Record<string, any>) => {
    let str = "";
    for (const i in obj) {
        str += `${i}: ${obj[i]};`
    }
    return str;
};

const elementSupportsAttribute = (element: string, attribute: string): boolean => {
    const test = document.createElement(element);
    return attribute in test;
};

const firstElementName = (str: string): string => {
    return str.split(" ").map(l => l.split(">")).flat()[0].slice(1);
};

const attributesToStr = (attributes: Record<string, string>) => {
    let str = "";
    for (const i in attributes) {
        if (i !== undefined) {
            str += `${i}="${attributes[i]}"`
        }
    }
    return str;
};

const insertAttributesIntoHTML = (html: string, attributes: Record<string, string>) => {
    let splitHTML = html.split(">");
    splitHTML[0] += ` ${attributesToStr(attributes)}`;
    return splitHTML.join(">");
};

const collapseNodeStyles = (node: Element) => {
    const styleStrings = document.createElement("style");
    const removeArr = [];

    const childNodes = node.children;

    if (childNodes.length > 0) {
        for (const i in childNodes) {
            if (childNodes[i] && childNodes[i].nodeName !== undefined && childNodes[i].nodeName.toLowerCase() === "style") {
                styleStrings.innerHTML += childNodes[i].innerHTML;
                removeArr.push(childNodes[i]);
            }
        }
    }

    for (const thing of removeArr) {
        node.removeChild(thing);
    }

    return [node, styleStrings];
};

export { mustacheRegex, objToCSS, elementSupportsAttribute, firstElementName, insertAttributesIntoHTML, collapseNodeStyles };
