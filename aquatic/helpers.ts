const mustacheRegex = /{{.*}}/g;
const styleRegex = /<style>(.|\n)*?<\/style>/g;

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

const removeStyleTags = (str: string) => {
    const splitStr = str.split(">").map(l => l.split("<")).flat();
    return splitStr[2];
};

const collapseNodeStyles = (nodes: string) => {
    const styleStrings: string[] = [];

    const newNodes = nodes.replace(styleRegex, (match) => {
        if (styleStrings.indexOf(removeStyleTags(match))) {
            styleStrings.push(removeStyleTags(match));
        }
        return "";
    });

    return [newNodes, `<style>${styleStrings.reduce((acc, cur) => acc + cur, "")}</style>`];
};

export { mustacheRegex, objToCSS, elementSupportsAttribute, firstElementName, insertAttributesIntoHTML, collapseNodeStyles };
