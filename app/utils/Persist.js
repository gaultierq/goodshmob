import {AsyncStorage} from "react-native";

export default class Persist {

}

function buildPersistentKey(key) {
    let perstentStore = "goodsh_store";
    return `${perstentStore}:${key}`;
}

function store(key, value) {
    AsyncStorage.multiSet([
        [buildPersistentKey(key), value],
    ]);
}

function store(key, value, key2, value2) {

    let toStore = [
        buildPersistentKey(key), value,
        buildPersistentKey(key2), value2,
    ];
    AsyncStorage.multiSet([toStore]);
}

function store(key, value, key2, value2, key3, value3) {

    let toStore = [
        buildPersistentKey(key), value,
        buildPersistentKey(key2), value2,
        buildPersistentKey(key3), value3,
    ];
    AsyncStorage.multiSet([toStore]);
}