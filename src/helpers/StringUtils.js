
export function toUppercase(type) {
    return _.upperFirst(type);
}

export function toLowercase(type) {
    return type.substr(0, 1).toLowerCase() + type.substr(1, type.length - 1);
}

//hash(null) = 0
export function hashCode(str) { // java String#hashCode
    let hash = 0;
    if (str) {
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
    }
    return Math.abs(hash);
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


export const fullName2 = ({firstName, lastName} = {}, separator = ' ') => _.join([firstName, lastName], separator)

export function fullName(user: Person): string {
    let {firstName, lastName} = user || {}
    return _.trim(_.join([firstName, lastName], ' '))
}

export function userFirstName(user: User) {
    return user ? `${user.firstName}` : "";
}

export function firstLetter(string: string): string {
    if (string && string.length > 0) return string.charAt(0)
    return ''
}


export function isId(id: string) {
    return /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/g.test(id)
}

export function isPositive(number: number) {
    return _.isFinite(number) && number >= 0
}


export function flatDiff(left, right) {

    let allKeys = _.union(_.keys(left), _.keys(right));

    return _.transform(allKeys, (diff, key) => {
        let leftValue = left[key];
        let rightValue = right[key];

        if (leftValue != rightValue) {
            diff[key] = {leftValue, rightValue}
        }
    }, {});
}
