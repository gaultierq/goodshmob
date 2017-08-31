import {AsyncStorage} from "react-native";


export function buildPersistentKey(key) {
    let perstentStore = "goodsh_store";
    return `${perstentStore}:${key}`;
}

export function store(key, value) {
    AsyncStorage.multiSet([
        [buildPersistentKey(key), value],
    ]);
}

export function store2(key, value, key2, value2) {

    let toStore = [
        buildPersistentKey(key), value,
        buildPersistentKey(key2), value2,
    ];
    AsyncStorage.multiSet([toStore]);
}

export function store3(key, value, key2, value2, key3, value3) {

    let toStore = [
        buildPersistentKey(key), value,
        buildPersistentKey(key2), value2,
        buildPersistentKey(key3), value3,
    ];
    AsyncStorage.multiSet([toStore]);
}