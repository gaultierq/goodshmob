
export function isUnique(activities) {
    let unique = activities.filter((elem, index, self) => {
        return index === self.indexOf(elem);
    });
    return unique.length === activities.length;
}


export function areEquals(array1, array2) {
    if (!array1 || _.size(array2) !== _.size(array1)) return true;
    for (let i = array2.length; i-- > 0;) {
        // let refKey = refKeys[i];
        // $FlowFixMe
        if (array1[i] !== array2[i]) return true;
    }
    return false;
}