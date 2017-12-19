

export const EVENT_MESSAGE = 'MESSAGE';

export type Message = {
    content: string,
    type: MessageType
}
export type MessageType = 'snack' | 'toast';