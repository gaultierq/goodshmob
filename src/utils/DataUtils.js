import build from 'redux-object'


//ask backend to sanitize types
export let sanitizeItemType = function (activityType) {
    let type;
    switch (activityType.toLowerCase()) {
        case "post":
        case "posts":
            type = "posts";
            break;
        case "sending":
        case "sendings":
            type = "sendings";
            break;
        case "saving":
        case "savings":
            type = "savings";
            break;
        case "creative-works":
        case "creative-work":
            type = "creativeWorks";
            break;
        case "tv-shows":
        case "tv-show":
            type = "tvShows";
            break;
    }
    //if (!type) throw new Error(`type not found for ${activityType}`);
    return type;
};

export function buildNonNullData(store, type, id: string) {
    let result = build(store, type, id);


    if (!result) {
        let sanitized = sanitizeItemType(type);
        result = build(store, sanitized, id);
        if (result) {
            console.warn(`data sanitize success:${type} -> ${sanitized}`)
        }
    }

    if (!result) throw new Error(`resource not found for type=${type} id=${id}`);
    return result;
}