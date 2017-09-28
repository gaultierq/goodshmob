import {API_DATA_FAILURE, API_DATA_REQUEST, API_DATA_SUCCESS} from '../utils/Api';
import Immutable from 'seamless-immutable';

const initialState = Immutable({
    isLoading: {},
    isLastSuccess: {},
    links: {}
});

export default function (state = initialState, action) {
    if (!action.apiAction) return state;

    let actionName = action.apiAction.name();
    switch (action.type) {
        case API_DATA_SUCCESS:
            //state = state.merge({links: {[action.baseType.name()]: action.type === API_DATA_SUCCESS}}, {deep: true});
        case API_DATA_FAILURE:
            state = state.merge({isLastSuccess: {[actionName]: action.type === API_DATA_SUCCESS}}, {deep: true});
        case API_DATA_REQUEST:
            state = state.merge({isLoading: {[actionName]: action.type === API_DATA_REQUEST}}, {deep: true});
    }
    return state;
}
