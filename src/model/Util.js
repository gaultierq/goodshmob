import Base from "./Base";
import * as Models from "./"

export function parse(data) {

    let store = {};

    if (data.included) {

        data.included.map((source) => {

            let obj: Base = this.createObject(source);
            if (obj) {
                store[obj.type] = store[obj.type] || {};
                store[obj.type][obj.id] = obj;
            }
        });
    }

    console.debug(`store=${JSON.stringify(store)}`);

    let result = [];
    data.data.map((o) => result.push(createObject(o, store)));


    return result;
}

class ParseError extends Error {

}

let formatMsg = function (msg, type, source) {
    return `${msg} for type=${type}, and source=${source}`;
};
let thrown = function (msg, type, source) {
    throw new ParseError(formatMsg(msg, type, source));
};


//1. create object instance (from type)
let toUppercase = function (type) {
    return type.substr(0, 1).toUpperCase() + type.substr(1, type.length - 1);
};

//2. flatten attributes
function createFlatObject(source) {

    let type: string;
    //if (!source.id) throw new ParseError("expecting id");
    type = source.type;

    if (!type) {
        //console.error(formatMsg("expecting type", type, source));
        return null;
    }

    console.debug(`creating object for type=${type}`);

    if (!type.endsWith("s")) thrown(`expecting plural`, type, source);

    type = type.substr(0, type.length - 1);

    let uppercased = type.split('-').map((part) => {
        return toUppercase(part);
    });
    let moduleId = uppercased.join('');

    //let moduleId = toUppercase(type);

    let clazz = Models[moduleId];
    if (!clazz) thrown(`model not found:${moduleId}`, type, source);

    let obj: Base = new clazz;

    obj.id = source.id;
    obj.type = type;

    //let obj: Base = new Base();
    if (source.attributes) {
        Object.assign(obj, source.attributes);
    }
    return obj;
}

/*
    1. create flat object
    2. fill relationship
    3. flatten relationships

    if the store is provided, and contains the element for type x id,
    then this element will be used to popoulate the resulting object.
     */
export function createObject(source: Source, store: any): Base {

    let result = createFlatObject(source);

    if (source.relationships) {
        let relResult = {};
        Object.getOwnPropertyNames(source.relationships).map((relKey)=>{
            let srcObj = source.relationships[relKey];
            if (!srcObj || !srcObj.data) return;

            let relObj: Base = createFlatObject(srcObj.data);

            if (relObj) {

                if (store && store[relObj.type]) {
                    let stored = store[relObj.type][relObj.id];
                    if (stored) {
                        console.debug("stored object found:" + JSON.stringify(stored));
                        Object.assign(relObj, stored);
                    }
                }
                relResult[relKey] = relObj;
            }
        });

        Object.assign(result, relResult);
    }



    return result;
}