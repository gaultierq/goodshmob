//import update from "immutability-helper";
import merge from 'deepmerge'

export const STAT_API_REQUEST_TIME = 'STAT_API_REQUEST_TIME';

/*
stat: {
    api: {
        request: {
            [name]: {
                average: avg,
                count: count,
            }
        }
    }
}
*/
export function statReducer(state = {}, action) {

    switch (action.type) {
        case STAT_API_REQUEST_TIME:
            let {value, url} = action;

            let path = `request.${url}`;
            let {avg, count} = _.get(state, path, {});
            if (!count) {
                avg = value;
                count = 1;
            }
            else {
                count++;
                avg += (value-avg) / count;
            }
            let stat = _.set({}, path,{avg, count});
            state = merge(state, stat);
            break;
    }
    return state;
}