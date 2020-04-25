const mustacheRegex = /{{.*}}/g;

const objToCSS = (obj: Record<string, any>) => {
    let str = "";
    for (const i in obj) {
        str += `${i}: ${obj[i]};`
    }
    return str;
};

export { mustacheRegex, objToCSS };
