var isMergeableObject = require('is-mergeable-object')

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {}
}

function cloneIfNecessary(value, optionsArgument) {
    var clone = optionsArgument && optionsArgument.clone === true
    return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}

//TODO: add option to return the same array
function defaultArrayMerge(target, source, optionsArgument) {
    var destination = target.slice()
    source.forEach(function(e, i) {
        if (typeof destination[i] === 'undefined') {
            destination[i] = cloneIfNecessary(e, optionsArgument)
        } else if (isMergeableObject(e)) {
            destination[i] = deepmerge(target[i], e, optionsArgument)
        } else if (target.indexOf(e) === -1) {
            destination.push(cloneIfNecessary(e, optionsArgument))
        }
    })
    return destination
}

function mergeObject(target, source, optionsArgument) {
    var destination = {}

    //clone the target
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function(key) {
            destination[key] = cloneIfNecessary(target[key], optionsArgument)
        })
    }
    let mutated = false;
    //target <- source
    Object.keys(source).forEach(function(key) {
        var c
        if (isMergeableObject(source[key]) && target[key]) {
            c = deepmerge(target[key], source[key], optionsArgument)

        } else {
            c = cloneIfNecessary(source[key], optionsArgument)
        }
        mutated = mutated || target[key] !== c;
        destination[key] = c;
    })

    return mutated && destination || target
}

function deepmerge(target, source, optionsArgument) {
    if (!target) {
        console.error("null target, source=" , source);
        return;
    }
    var sourceIsArray = Array.isArray(source)
    var targetIsArray = Array.isArray(target)
    var options = optionsArgument || { arrayMerge: defaultArrayMerge }
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray
    if (!sourceAndTargetTypesMatch) {
        return cloneIfNecessary(source, optionsArgument)
    } else if (sourceIsArray) {
        var arrayMerge = options.arrayMerge || defaultArrayMerge
        return arrayMerge(target, source, optionsArgument)
    } else {
        return mergeObject(target, source, optionsArgument)
    }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array) || array.length < 2) {
        throw new Error('first argument should be an array with at least two elements')
    }

    // we are sure there are at least 2 values, so it is safe to have no initial value
    return array.reduce(function(prev, next) {
        return deepmerge(prev, next, optionsArgument)
    })
}

module.exports = deepmerge
