import {config, data as data1, pending} from './dataReducer'
import activity from '../ui/activity/reducer';
import {reducer as network} from '../ui/networkActions';
import {reducer as savings} from '../ui/screens/lineup';
import {reducer as comments1} from '../ui/screens/comments';
import {reducer as comments2} from '../ui/components/CommentInput';
import {reducer as friends} from '../ui/screens/friends';
import {reducer as lineups} from '../ui/screens/lineuplist';
import lineups2 from '../ui/lineup/reducer';
import {reducer as peopleYouMayKnow} from '../ui/screens/community';
import {reducer as interaction} from '../ui/screens/interactions';
import {statReducer as stat} from '../managers/Statistics';
import {authReducer as auth, deviceReducer as device} from '../auth/reducer';
import OnBoardingManager from "../managers/OnBoardingManager";
import {reducer as followed_lists} from "../ui/screens/MyInterests";
import {reducer as popular_items} from "../ui/screens/popularitems";


import app from './app';

function reduceReducers(...reducers) {
    return (previous, current) =>
        reducers.reduce(
            (p, r) => r(p, current),
            previous
        );
}

let comments = reduceReducers(comments1, comments2);

let data = reduceReducers(
    data1,
    activity,
    comments,
    friends,
    savings,
    lineups,
    lineups2
);

const onBoarding = OnBoardingManager.createReducer();

export {
    app,
    data,
    network,
    peopleYouMayKnow,
    auth,
    stat,
    device,
    interaction,
    config,
    pending,
    onBoarding,
    followed_lists,
    popular_items
    // search,
};
