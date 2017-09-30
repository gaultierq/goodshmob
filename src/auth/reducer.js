import Immutable from 'seamless-immutable';
import * as types from "./actionTypes";

const initialState = Immutable({
    currentUserId: '',
    client: '',
    uid: '',
    accessToken: ''

});

export function createWithReducers(appReducers) {
    return (state, action) => {
        switch (action.type) {
            case types.USER_LOGOUT:
                state = undefined;
                break;
        }

        return appReducers(state, action);
    }
}

export default function (state = initialState, action) {

    switch (action.type) {
        case types.API_AUTH:
            let {client, uid, accessToken} = action;
            state = state.merge({client, uid, accessToken});
            break;
        case types.USER_LOGIN.success():
            //TODO: api return built object
            let currentUserId = action.payload.data.id;
            state = state.merge({currentUserId});
            break;
        case types.USER_LOGOUT:
            state = initialState;
            break;
    }
    return state;
}
