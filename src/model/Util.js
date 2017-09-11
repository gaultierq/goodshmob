import Base from "./Base";
import * as Models from "./"

export function parse(data) {
    let result = data.data;

    if (data.included) {
        let byId = {};

        data.included.map((source) => {

            let obj: Base = this.createObject(source);
            byId[obj.id] = obj;
        });

    }

    console.log("PARSING RESULT:"+JSON.stringify(result));
    return result;
}

/*
    -1. create object instance (from type)
    2. flatten attributes
    3. fill relationship
    4. flatten relationships
     */
export function createObject(source: Source): Base {
    if (!source.id) throw new Error("expecting id");

    let type: string = source.type;
    if (!type) throw new Error("expecting type");

    if (!type.endsWith("s")) throw new Error("expecting plural for type");
    type = type.substr(0, type.length - 1);

    let a = Models.prototype;
    let b = Models.User;

    let moduleId = type.substr(0, 1).toUpperCase() + type.substr(1, type.length - 1);
    let clazz = Models[moduleId];
    if (!clazz) throw new Error("model not found for " + type);
    let obj = new clazz;

    //let obj: Base = new Base();
    if (source.attributes) {
        Object.assign(obj, source.attributes);
    }
    if (source.relationships) {

    }

    return obj;
}