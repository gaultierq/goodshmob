
export function toUppercase(type) {
    return _.upperFirst(type);
}

export function toLowercase(type) {
    return type.substr(0, 1).toLowerCase() + type.substr(1, type.length - 1);
}

// Decorator function for logging
export function logger(target, name, descriptor) {

    // obtain the original function
    let fn = descriptor.value;

    // create a new function that sandwiches
    // the call to our original function between
    // two logging statements
    let newFn  = () => {
        console.log('starting %s', name);
        fn.apply(target, arguments);
        console.log('ending %s', name);
    };

    // we then overwrite the origin descriptor value
    // and return the new descriptor
    descriptor.value = newFn;
    return descriptor;
}


export function fullName(user: User) {
    return user ? `${user.firstName} ${user.lastName}` : "";
}

export function userFirstName(user: User) {
    return user ? `${user.firstName}` : "";
}


export function isId(id: string) {
    return /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/g.test(id)

}
