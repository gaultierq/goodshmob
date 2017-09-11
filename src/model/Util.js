import Base from "./Base";
import * as Models from "./"

export function parse(data) {
    let result = [];

    data.data.map((o) => result.push(createObject(o)));

    if (data.included) {
        let byId = {};

        data.included.map((source) => {

            let obj: Base = this.createObject(source);
            byId[obj.id] = obj;
        });
    }
    return result;
}

class ParseError extends Error {

}

function createObjectInternal(source) {

    let type: string;
    if (!source.id) throw new ParseError("expecting id");
    type = source.type;

    if (!type) throw new ParseError("expecting type");

    console.debug(`creating object for type=${type}`);

    if (!type.endsWith("s")) throw new ParseError(`expecting plural for type=${type}`);
    type = type.substr(0, type.length - 1);

    let moduleId = type.substr(0, 1).toUpperCase() + type.substr(1, type.length - 1);
    let clazz = Models[moduleId];
    if (!clazz) throw new ParseError(`model not found for type=${type}`);
    let obj = new clazz;

    //let obj: Base = new Base();
    if (source.attributes) {
        Object.assign(obj, source.attributes);
    }
    if (source.relationships) {

    }
    return obj;

}

/*
    -1. create object instance (from type)
    2. flatten attributes
    3. fill relationship
    4. flatten relationships
     */
export function createObject(source: Source): Base {
    return createObjectInternal(source);
}