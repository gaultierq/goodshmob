import { API_DATA_SUCCESS } from '../utils/Api';
import Immutable from 'seamless-immutable';

const initialState = Immutable({
    meta: {},
});

export default function (state = initialState, action) {
    switch (action.type) {
        case API_DATA_SUCCESS:
            return state.merge(action.data, {deep: true});
        default:
            return state;
    }
}
