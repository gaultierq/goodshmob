import data1 from './dataReducer'
import activity from '../activity/reducer';
import {reducer as network} from '../screens/networkActions';
import {reducer as savings} from '../screens/savings';
import {reducer as search} from '../screens/search';
import {reducer as comments} from '../screens/comments';
import {reducer as lineups} from '../screens/lineups';
import {authReducer as auth, deviceReducer as device} from '../auth/reducer';

function reduceReducers(...reducers) {
    return (previous, current) =>
        reducers.reduce(
            (p, r) => r(p, current),
            previous
        );
}

let data = reduceReducers(
    data1,
    activity,
    comments,
    savings,
    lineups
);


export {
    data,
    network,
    auth,
    device,
    search,
};
