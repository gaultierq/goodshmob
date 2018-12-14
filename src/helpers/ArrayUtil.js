
export function isUnique(activities) {
    let unique = activities.filter((elem, index, self) => {
        return index === self.indexOf(elem);
    });
    return unique.length === activities.length;
}


export function isEqualsArrayFree(obj1, obj2) {
    if (obj1 === obj2) return true
    if (_.isArray(obj1) && _.isArray(obj2)) return !areNotEquals(obj1, obj2)
    return false
}

export function areNotEquals(array1, array2) {

    if (!array1 || _.size(array2) !== _.size(array1)) return true;
    for (let i = array2.length; i-- > 0;) {
        // let refKey = refKeys[i];
        // $FlowFixMe
        if (array1[i] !== array2[i]) return true;
    }
    return false;
}

export function indexOfOr0(array, predicate) {
    if (array && predicate) {
        let i = 0
        const length = array.length
        for (; i < length; i ++) {
            let el = array[i]
            if (predicate(el)) return i
        }
    }
    return 0
}

export function toggle(array, element) {

    if (_.isArray(array)) {
        let i = _.indexOf(array, element)
        if (i === -1) {
            array.push(element)
        }
        else {
            array.splice(i, 1)
        }
    }

}
