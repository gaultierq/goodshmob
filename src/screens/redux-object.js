/* eslint no-use-before-define: [1, 'nofunc'] */

function uniqueId(objectName, id) {
    if (!id) {
        return null;
    }

    return `${objectName}${id}`;
}

function buildRelationship(reducer, target, relationship, options, cache) {
    const { ignoreLinks } = options;
    const rel = target.relationships[relationship];

    let data = rel.data;
    if (typeof data !== 'undefined') {
        if (isImmutable(data)) {
            data = data.asMutable();
        }
        if (Array.isArray(data)) {
            return data.map(child => build(reducer, child.type, child.id, options, cache) || child);
        } else if (data === null) {
            return null;
        }
        return build(reducer, data.type, data.id, options, cache) || data;
    } else if (!ignoreLinks && rel.links) {
        throw new Error('Remote lazy loading is not supported (see: https://github.com/yury-dymov/json-api-normalizer/issues/2). To disable this error, include option \'ignoreLinks: true\' in the build function like so: build(reducer, type, id, { ignoreLinks: true })');
    }

    return undefined;
}


export default function build(reducer, objectName, id = null, providedOpts = {}, cache = {}) {
    const defOpts = { eager: false, ignoreLinks: false, includeType: false };
    const options = Object.assign({}, defOpts, providedOpts);
    const { eager, includeType } = options;

    if (!reducer[objectName]) {
        return null;
    }

    if (id === null || Array.isArray(id)) {
        const idList = id || Object.keys(reducer[objectName]);

        return idList.map(e => build(reducer, objectName, e, options, cache));
    }

    const ids = id.toString();
    const uuid = uniqueId(objectName, ids);
    const cachedObject = cache[uuid];

    if (cachedObject) {
        return cachedObject;
    }

    const ret = {};
    let target = reducer[objectName][ids];

    if (!target) {
        return null;
    }
    if (isImmutable(target)) {
        target = target.asMutable();
    }

    if (target.id) {
        ret.id = target.id;
    }

    Object.keys(target.attributes).forEach((key) => { ret[key] = target.attributes[key]; });

    if (target.meta) {
        ret.meta = target.meta;
    }

    if (includeType && !ret.type) {
        ret.type = objectName;
    }

    cache[uuid] = ret;

    if (target.relationships) {
        Object.keys(target.relationships).forEach((relationship) => {
            if (eager) {
                ret[relationship] = buildRelationship(reducer, target, relationship, options, cache);
            } else {
                Object.defineProperty(
                    ret,
                    relationship,
                    {
                        get: () => {
                            const field = `__${relationship}`;

                            if (ret[field]) {
                                return ret[field];
                            }

                            ret[field] = buildRelationship(reducer, target, relationship, options, cache);

                            return ret[field];
                        },
                    },
                );
            }
        });
    }

    if (typeof ret.id === 'undefined') {
        ret.id = ids;
    }
    return ret;
}

var immutabilityTag = "__immutable_invariants_hold";

function isImmutable(target) {
    if (typeof target === "object") {
        return target === null || Boolean(
            Object.getOwnPropertyDescriptor(target, immutabilityTag)
        );
    } else {
        // In JavaScript, only objects are even potentially mutable.
        // strings, numbers, null, and undefined are all naturally immutable.
        return true;
    }
}