import {API_AUTH} from '../utils/Api';
import Immutable from 'seamless-immutable';
import {USER_LOGIN, USER_LOGOUT} from "./authActionTypes";


const initialState = Immutable({
    currentUserId: '',
    client: '',
    uid: '',
    accessToken: ''

});

export default function (state = initialState, action) {

    switch (action.type) {
        case API_AUTH:
            let {client, uid, accessToken} = action;
            state = state.merge({client, uid, accessToken});
            break;
        case USER_LOGIN.success():
            //TODO: api return built object
            let currentUserId = action.payload.data.id;
            state = state.merge({currentUserId});
            break;
        case USER_LOGOUT:
            state = initialState;
            break;
    }
    return state;
}
