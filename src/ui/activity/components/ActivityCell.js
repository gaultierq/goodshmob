// @flow

import React from 'react';
import type {Node} from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../../managers/CurrentUser"
import {buildNonNullData, sanitizeActivityType} from "../../../helpers/DataUtils";
import type {Activity, ActivityType, Id, RNNNavigator} from "../../../types"
import ActivityBody from "./ActivityBody";
import ActivityActionBar from "./ActivityActionBar";
import {Avatar} from "../../UIComponents";
import {seeUser} from "../../Nav";
import GTouchable from "../../GTouchable";
import * as activityAction from "../actions";
import {getPendingLikeStatus} from "../../rights";
import {SFP_TEXT_BOLD} from "../../fonts";
import {Colors} from "../../colors";
import User from "react-native-firebase/lib/modules/auth/user";
import {stylePadding} from "../../UIStyles";

export type ActivityDisplayContext = {

}

type Props = {
    data: any,
    activity: Activity,
    activityId: Id,
    activityType: ActivityType,
    navigator: any,
    onPressItem: (any) => void,
    skipLineup:? boolean;
    skipDescription:? boolean;
};

type State = {
};


const AVATAR_DIM = 34;

@logged
@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending
}))
export default class ActivityCell extends React.Component<Props, State> {

    refKeys: any;



    render() {
        let activity = this.getActivity();
        this.refKeys = this.makeRefObject(this.props);

        if (sanitizeActivityType(activity.type) === 'asks') {
            return (
                <View style={[styles.askContent, {backgroundColor: this.getAskBackgroundColor(activity)}]}>
                    {this.renderUserAvatar(activity.user, {position: 'absolute', zIndex: 2, top: 15, left: 15})}
                    <Text style={[styles.askText]}>{activity.content}</Text>
                    <View style={{width: "100%"}}>
                        {!activity.pending && <ActivityActionBar
                            activityId={activity.id}
                            activityType={activity.type}
                            navigator={this.props.navigator}
                        />
                        }
                    </View>

                </View>
            )
        }

        let target = activity.target;
        let postedToUser = target && target.type === 'users' && target;
        // const {skipLineup, withFollowButton} = this.props;
        // if (skipLineup) return null;

        const user = activity.user;
        return (
            <View>
                <View style={{zIndex: 2, position: 'absolute', left: 12, top: 12}}>
                    {this.renderUserGeneral(user, postedToUser)}
                </View>

                <View>
                    <GTouchable activeOpacity={0.9} onPress={this.props.onPressItem} onDoublePress={() => {
                        let liked = this.isLiked(activity);
                        const toggleLike = liked ? activityAction.unlike : activityAction.like;
                        this.props.dispatch(toggleLike(activity.id, activity.type));
                    }}>
                        <ActivityBody
                            activity={activity}
                            liked={this.isLiked(activity)}
                            navigator={this.props.navigator}
                            skipLineup={this.props.skipLineup}
                        />
                    </GTouchable>

                    {/*<FeedSeparator/>*/}


                    <ActivityActionBar
                        activityId={activity.id}
                        activityType={activity.type}
                        navigator={this.props.navigator}
                    />
                </View>
            </View>
        )
    }

    getAskBackgroundColor(activity: Activity) {
        const askColors = ['rgb(51,51,51)', /*Colors.green, */Colors.pink, Colors.darkSkyBlue];
        return askColors[Date.parse(activity.createdAt) % askColors.length];
    }

    renderUserAvatar(user: User, styles?: *) {
        let navigator: RNNNavigator = this.props.navigator;
        return this.wrapUserAvatar(
            <GTouchable onPress={() => seeUser(navigator, user)}>
                <Avatar user={user} style={{
                    dim: AVATAR_DIM,
                }}/>
            </GTouchable>,
            styles
        )
    }

    renderUserGeneral(user: User, user2?: User, style?: ?*) {
        let navigator: RNNNavigator = this.props.navigator;
        // let result = this.wrapUserAvatar(
        return this.wrapUserAvatar(
            <View style={{
                flexDirection: 'row',
                alignItems: 'center'
            }}>
                {this.renderAvatar(navigator, user)}
                {user2 && <Image style={{margin: 10}} tintColor={Colors.black} source={require('../../../img2/rightArrowSmallGrey.png')}/>}
                {user2 && this.renderAvatar(navigator, user2)}
            </View>,
            style
        );
    }

    renderAvatar(navigator, user) {

        return <GTouchable onPress={() => seeUser(navigator, user)}>
            <Avatar user={user} style={{
                dim: AVATAR_DIM,
            }}/>
        </GTouchable>;
    }

    wrapUserAvatar(children: Node, styles?: *) {
        const padding = 6;

        const shadowHeightShift = __IS_IOS__ ?  1 : 0;
        return <View style={[styles, {
            borderColor: Colors.greyish,
            borderWidth: StyleSheet.hairlineWidth,

            shadowColor: Colors.greyish,
            shadowOpacity: 0.4,
            shadowRadius: 0,
            shadowOffset: {width: 0, height: shadowHeightShift * 2},


            elevation: 50,
            borderRadius: (AVATAR_DIM + 2 * padding)* 0.5,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            ...stylePadding(padding, padding - shadowHeightShift, padding, padding + shadowHeightShift),
        }]}>
            <View style={{
                shadowColor: Colors.brownishGrey,
                shadowOpacity: 1,
                shadowRadius: 2,
                elevation: 2,
                shadowOffset: {width: 0, height: shadowHeightShift},
            }}>
                {children}
            </View>
        </View>;
    }

    isLiked(activity) {
        const pendingLikeStatus = getPendingLikeStatus(this.props.pending, activity);
        return pendingLikeStatus ?
            pendingLikeStatus > 0
            : activity.meta && activity.meta["liked"];
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!ENABLE_PERF_OPTIM) return true;

        if (!this.hasChanged(nextProps)) {
            superLog('ActivityCell render saved');
            return false;
        }
        return true;
    }

    hasChanged(nextProps:Props): boolean {
        let oldRefKeys = this.refKeys;
        if (!oldRefKeys) return true;

        let nextRefKeys = this.makeRefObject(nextProps);

        let refKeys = this.getRefKeys(nextProps);

        for (let i = 0; i < refKeys.length; i++) {
            let refKey = refKeys[i];
            // $FlowFixMe
            if (oldRefKeys[refKey] !== nextRefKeys[refKey]) return true;
        }
        return false;

    }


    makeRefObject(nextProps:Props) {
        let refKeys = this.getRefKeys(nextProps);

        return refKeys.reduce((res, key)=> {
            // $FlowFixMe
            res[key] = _.get(nextProps, key);
            return res;
        }, {});
    }

    getRefKeys(nextProps: Props) {
        let activityType = sanitizeActivityType(nextProps.activityType);
        let base = `data.${activityType}.${nextProps.activityId}`;
        return [base, `${base}.meta`, 'pending'];
    }

    getActivity() {
        return this.props.activity || buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }
}

const styles = StyleSheet.create({
    askText: {
        fontSize: 30,
        lineHeight: 35,
        color: Colors.white,
        textAlign: 'center',
        fontFamily: SFP_TEXT_BOLD,
        padding: 50
    },
    askContent: {
        width: "100%",
        minHeight: 64,
        // backgroundColor: "pink",
        alignItems: 'center',
        justifyContent: 'center'
    }

});
