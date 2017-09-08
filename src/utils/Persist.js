import {AsyncStorage} from "react-native";

export const USER_KEY = "user";
export const ACCESS_TOKEN_KEY = "access_token";
export const CLIENT_KEY = "client";
export const UID_KEY = "uid";

const PERIST_KEY = "goodsh_store";

export function buildPersistentKey(key) {
    
    return `${PERIST_KEY}:${key}`;
}

export function readMany(keys) {
    return new Promise((resolve, reject) => {

        let authKeys = keys.map((k) => buildPersistentKey(k));

        let result = {};

        AsyncStorage.multiGet(authKeys, (err, stores) => {
            //console.debug("asdasdasd:" + JSON.stringify(stores));
            stores.map((s) => {
                let k: string = s[0];
                //console.assert(k.startsWith(PERIST_KEY));
                k = k.substr(PERIST_KEY.length + 1);

                //console.assert(!(k in result));
                result[k] = s[1];
            });

            console.debug(`read from storage: ${JSON.stringify(result)}`);

            resolve(result);
        });
    });
}
