import {config, data as data1, pending} from './dataReducer'
import activity from '../ui/activity/reducer';
import {reducer as network} from '../ui/networkActions';
import {reducer as savings} from '../ui/screens/lineup';
import {reducer as comments} from '../ui/screens/comments';
import {reducer as friends} from '../ui/screens/friends';
import {reducer as lineups} from '../ui/screens/lineuplist';
import lineups2 from '../ui/lineup/reducer';
import {reducer as peopleYouMayKnow} from '../ui/screens/community';
import {reducer as interaction} from '../ui/screens/interactions';
import {statReducer as stat} from '../managers/Statistics';
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
    friends,
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
