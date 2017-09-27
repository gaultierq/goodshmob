import build from 'redux-object'

export function buildNonNullData(store, type, id) {
    let result = build(store, type, id);

    function sanitize(type) {
        switch (type) {
            case "Saving":
                return "savings";
        }
    }

    if (!result) {
        let sanitized = sanitize(type);
        result = build(store, sanitized, id);
        if (result) {
            console.warn(`data sanitize success:${type} -> ${sanitized}`)
        }
    }

    if (!result) throw new Error(`resource not found for type=${type} id=${id}`);
    return result;
}