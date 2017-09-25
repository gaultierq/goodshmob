import { API_DATA_REQUEST, API_DATA_SUCCESS } from '../middleware/apiMiddleware';
import Immutable from 'seamless-immutable';

const initialState = Immutable({
    meta: {},
});

export default function (state = initialState, action) {
    switch (action.type) {
        case API_DATA_SUCCESS:
            return state.merge(action.response, { meta: { [action.endpoint]: { loading: false } } });
        default:
            return state;
    }
}
