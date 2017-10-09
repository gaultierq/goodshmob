import { API_DATA_SUCCESS } from '../utils/Api';
import Immutable from 'seamless-immutable';
import merge from 'deepmerge'

const initialState = Immutable({
    meta: {},
});

export default function (state = initialState, action) {
    switch (action.type) {
        case API_DATA_SUCCESS:
            return merge(state, action.data);
        default:
            return state;
    }
}
