import {API_DATA_FAILURE, API_DATA_REQUEST, API_DATA_SUCCESS} from '../middleware/apiMiddleware';
import Immutable from 'seamless-immutable';

const initialState = Immutable({
    isLoading: {},
});

export default function (state = initialState, action) {
    switch (action.type) {
        case API_DATA_SUCCESS:
        case API_DATA_FAILURE:
        case API_DATA_REQUEST:
            return state.merge({isLoading: {[action.baseType]: action.type === API_DATA_REQUEST}});
        default:
            return state;
    }
}
