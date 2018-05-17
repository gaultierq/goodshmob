

export function getFirstDefined() {
    let result;
    for (result in arguments) if (!_.isNil(result)) break
    return result
}