

export function getFirstDefined() {
    let result;

    for(var arg = 0; arg < arguments.length; ++ arg) {
        if (!_.isNil(result = arguments[arg])) break
    }
    return result
}