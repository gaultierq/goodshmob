// @flow

import Config from "react-native-config"


export function createOpenModalLink(screen:string , title: ?string, passProps?: any) {
    let result = `${Config.GOODSH_PROTOCOL_SCHEME}://it/openmodal?screen=${screen}`
    if (title) {
        result = result + `&title=${encodeURIComponent(title)}`
    }
    if (passProps) {
        result = result + "&passProps=" + encodeURIComponent(JSON.stringify(passProps))
    }
    return result
}
