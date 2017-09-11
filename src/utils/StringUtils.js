export function toUppercase(type) {
    return type.substr(0, 1).toUpperCase() + type.substr(1, type.length - 1);
}

export function toLowercase(type) {
    return type.substr(0, 1).toLowerCase() + type.substr(1, type.length - 1);
}
