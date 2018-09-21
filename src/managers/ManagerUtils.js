import EventBus from "eventbusjs"


export type LoginChangeOptions = {
    onUser?: () => void,
    onNoUser?: () => void,
    triggerOnListen?: ? {
        payload: ?Id
    }
}

export const CURRENT_USER_ID_CHANGE = 'USER_CHANGE'


export function listenToLoginChange(options: LoginChangeOptions) {
    const {onUser, onNoUser, triggerOnListen} = options

    let callback = (currentUserId: ?Id) => {
        if (currentUserId) onUser && onUser()
        else onNoUser && onNoUser()
    }

    let triggering
    EventBus.addEventListener(CURRENT_USER_ID_CHANGE, event => {
        if (triggering) {
            console.warn("looping")
            return
        }

        const {currentUserId} = event.target

        callback(currentUserId)
    })

    if (triggerOnListen) {
        triggering = true
        callback(triggerOnListen.payload)
        triggering = false
    }
}
