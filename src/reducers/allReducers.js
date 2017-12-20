import {config, data as data1, pending} from './dataReducer'
import activity from '../activity/reducer';
import {reducer as network} from '../screens/networkActions';
import {reducer as savings} from '../screens/lineup';
import {reducer as comments} from '../screens/comments';
import {reducer as lineups} from '../screens/lineuplist';
import lineups2 from '../lineup/reducer';
import {reducer as peopleYouMayKnow} from '../screens/community';
import {reducer as interaction} from '../screens/interactions';
import {statReducer as stat} from '../utils/Statistics';
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
    lineups,
    lineups2
);


export {
    data,
    network,
    peopleYouMayKnow,
    auth,
    stat,
    device,
    interaction,
    config,
    pending,
    // search,
};
