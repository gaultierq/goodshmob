// @flow

import Base from "../model/Base";
import * as Models from "../model/index"
import * as StringUtils from "./StringUtils"

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

    return data.data.map((o) => createObject(o, store));
}

class ParseError extends Error {

}

let formatMsg = function (msg, type, source) {
    return `${msg} for type=${type}, and source=${source}`;
};

let thrown = function (msg, type, source) {
    throw new ParseError(formatMsg(msg, type, source));
};


let assignSafe = function (target, src) {
    for (let p in src) {
        if (src.hasOwnProperty(p)) {
            let pp = StringUtils.toLowercase(dashToCamel(p));
            target[pp] = src[p];
        }
    }
};

let dashToCamel = function (type) {
    let uppercased = type.split('-').map((part) => {
        return StringUtils.toUppercase(part);
    });
    return uppercased.join('');
};

//2. flatten attributes
//type will be singular, CamelCased
function createFlatObject(source): Base {

    let type: string;
    //if (!source.id) throw new ParseError("expecting id");
    type = source.type;

    if (!type) {
        //console.error(formatMsg("expecting type", type, source));
        return null;
    }

    //console.debug(`creating object for type=${type}`);

    if (!type.endsWith("s")) thrown(`expecting plural`, type, source);

    //remove the plurals
    type = type.substr(0, type.length - 1);

    let moduleId: string = dashToCamel(type);

    //let moduleId = toUppercase(type);

    let clazz = Models[moduleId];
    if (!clazz) thrown(`model not found:${moduleId}`, type, source);

    let obj: Base = new clazz;

    obj.id = source.id;
    obj.type = moduleId;

    //let obj: Base = new Base();
    if (source.attributes) {
        assignSafe(obj, source.attributes);
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

                // if (relObj.id === "5c981d29-ec75-4f16-b326-4c52b54a456e") {
                //     console.log("TEST: " + JSON.stringify(relObj));
                // }
                if (store && store[relObj.type]) {
                    let stored = store[relObj.type][relObj.id];
                    if (stored) {
                        // console.debug("stored object found:" + JSON.stringify(stored));
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