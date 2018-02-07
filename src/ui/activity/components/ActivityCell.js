// @flow

import React from 'react';
import type {Node} from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../../managers/CurrentUser"
import {buildNonNullData, sanitizeActivityType} from "../../../helpers/DataUtils";
import type {Activity, ActivityType, i18Key, Id, RNNNavigator} from "../../../types"
import ActivityBody from "./ActivityBody";
import ActivityActionBar from "./ActivityActionBar";
import {Avatar, renderTag} from "../../UIComponents";
import {seeUser} from "../../Nav";
import GTouchable from "../../GTouchable";
import * as activityAction from "../actions";
import {getPendingLikeStatus} from "../../rights";
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC, SFP_TEXT_MEDIUM} from "../../fonts";
import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors";
import User from "react-native-firebase/lib/modules/auth/user";
import {stylePadding} from "../../UIStyles";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {firstName} from "../../../helpers/StringUtils";
import Octicons from "react-native-vector-icons/Octicons";
import ActivityStatus from "./ActivityStatus";
import FeedSeparator from "./FeedSeparator";

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


    renderDebugActivityInfo(activity: Activity) {
        return (
            <View>
                {_.keys(activity).map(k => <Text style={{fontSize: 9}}>{`${k}=${activity[k]}`}</Text>)}
            </View>
        );
    }

    render() {
        let activity = this.getActivity();
        this.refKeys = this.makeRefObject(this.props);

        if (sanitizeActivityType(activity.type) === 'asks') {
            return (
                <View style={[_styles.askContent, {backgroundColor: this.getAskBackgroundColor(activity)}]}>
                    {this.renderUserAvatar(activity.user, _styles.userAvatar)}
                    <Text style={[_styles.askText]}>{activity.content}</Text>
                    {__DEBUG_SHOW_IDS__ && this.renderDebugActivityInfo(activity) }
                    <View style={_styles.width100}>
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

        return (
            <View>

                <View>

                    <ActivityStatus
                        activity={activity}
                        skipLineup={this.props.skipLineup}
                        navigator={this.props.navigator}
                        cardStyle={{padding: 8,
                        }}
                    />
                    <FeedSeparator/>

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

                        {/*<ActivityStatus*/}
                            {/*activity={activity}*/}
                            {/*skipLineup={this.props.skipLineup}*/}
                            {/*navigator={this.props.navigator}*/}
                        {/*/>*/}

                    </GTouchable>

                    {/*<FeedSeparator/>*/}

                    {__DEBUG_SHOW_IDS__ && this.renderDebugActivityInfo(activity)}
                    <ActivityActionBar
                        activityId={activity.id}
                        activityType={activity.type}
                        navigator={this.props.navigator}
                    />
                </View>
            </View>
        )
    }


    // renderActivity(activity) {
    //
    //     return <View>
    //         <View style={{flex: 1, flexDirection: 'row', ...stylePadding(0, 14)}}>
    //             <Avatar user={activity.user} style={{dim: 26, marginRight: 8, marginTop: 0}}/>
    //             <View style={{flex: 1, marginTop: 3}}>
    //                 {this.renderTags()}
    //             </View>
    //
    //         </View>
    //
    //         <View style={{flex: 1, flexDirection: 'row',}}>
    //             {activity.description &&
    //             <Octicons name="quote" size={10} color={Colors.brownishGrey} style={{alignSelf: 'flex-start'}}/>}
    //             {activity.description && <Text numberOfLines={3} style={[styles.description, {
    //                 flex: 1,
    //                 alignItems: 'center',
    //                 textAlignVertical: 'center', ...stylePadding(6, 0)
    //             }]}>{activity.description}</Text>}
    //
    //         </View>
    //     </View>;
    // }

    // renderTags() {
    //     let activity, target, targetName: string, key: i18Key, press: () => void;
    //     if (!(activity = this.getActivity())) return null;
    //     if (activity.type === 'asks') throw 'no ask';
    //
    //     // const {skipLineup, withFollowButton} = this.props;
    //     // if (skipLineup) return null;
    //
    //
    //     if (!(target = activity.target)) return null;
    //
    //     if (target.type === 'lists') {
    //         let count = target.meta ? target.meta["savingsCount"] : 0;
    //         targetName = target.name;
    //         if (count) targetName += " (" + count + ")";
    //
    //         key = "activity_item.header.in";
    //         press = () => seeList(this.props.navigator, target);
    //     }
    //     else if (target.type === 'users') {
    //         // targetName = target.firstName + " " + target.lastName;
    //         // key = "activity_item.header.to";
    //         // press = () => seeUser(this.props.navigator, target);
    //         //new spec. todo clean
    //         return null;
    //     }
    //     if (!this.props.skipLineup) {
    //         return(
    //             <View style={styles.tag}>
    //                 <Text style={{
    //                     textAlign: 'center',
    //                     marginRight: 8,
    //                     fontFamily: SFP_TEXT_MEDIUM,
    //                     fontsize: 12,
    //                     color: Colors.greyishBrown}}>{i18n.t(key)}</Text>
    //                 {renderTag(targetName, press)}
    //             </View>
    //         )
    //     }
    //     else  return null;
    // }


    getAskBackgroundColor(activity: Activity) {
        const askColors = ['rgb(51,51,51)', Colors.pink, Colors.darkSkyBlue];
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

    // renderUserGeneral(user: User, user2?: User, style?: ?*) {
    //     let navigator: RNNNavigator = this.props.navigator;
    //     // let result = this.wrapUserAvatar(
    //     return this.wrapUserAvatar(
    //         <View style={_styles.userWrap}>
    //             {this.renderAvatar(navigator, user)}
    //             {user2 && <Image style={_styles.userImage} tintColor={Colors.black} source={require('../../../img2/rightArrowSmallGrey.png')}/>}
    //             {user2 && this.renderAvatar(navigator, user2)}
    //         </View>,
    //         style
    //     );
    // }

    // renderAvatar(navigator, user) {
    //
    //     return <GTouchable onPress={() => seeUser(navigator, user)}>
    //         <Avatar user={user} style={{
    //             dim: AVATAR_DIM,
    //         }}/>
    //     </GTouchable>;
    // }

    wrapUserAvatar(children: Node, styles?: *) {
        const padding = 3;

        const shadowHeightShift = __IS_IOS__ ?  StyleSheet.hairlineWidth : 0;
        return <View style={[styles, _styles.userAvatarWrapper, {
            shadowOffset: {width: 0, height: shadowHeightShift * 2},
            borderRadius: (AVATAR_DIM + 2 * padding)* 0.5,
            ...stylePadding(padding, padding - shadowHeightShift, padding, padding + shadowHeightShift),
        }]}>
            <View style={[_styles.userAvatarChildren, {shadowOffset: {width: 0, height: shadowHeightShift}}]}>
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
    body: {padding: 15, paddingBottom: 0, backgroundColor: ACTIVITY_CELL_BACKGROUND},
    bodyInner: {flexDirection: 'row'},
    flex1: {flex:1},
    title: {fontSize: 19, color: Colors.black, marginBottom: 4, marginRight: 5},
    subtitle: {fontSize: 14, color: Colors.greyish},
    description: {fontSize: 14, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
    imageContainer: {flex:1, alignSelf: 'center', width: "100%", backgroundColor: 'transparent'},
    image: {alignSelf: 'center', backgroundColor: ACTIVITY_CELL_BACKGROUND, width: "100%"},
    yheaaContainer: {position: 'absolute', width: "100%", height: "100%",backgroundColor: 'rgba(0,0,0,0.3)',alignItems: 'center',justifyContent: 'center'},
    tag: {flexDirection:'row', alignItems: 'center'},
    askText: {margin: 12, fontSize: 30}
});


const _styles = StyleSheet.create({
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
        alignItems: 'center',
        justifyContent: 'center'
    },
    userAvatar: {
        position: 'absolute',
        zIndex: 2,
        top: 15,
        left: 15
    },
    width100: {
        width: "100%"
    },
    posted: {
        zIndex: 2,
        position: 'absolute',
        left: 12,
        top: 12
    },
    userWrap: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    userImage: {
        margin: 10
    },
    userAvatarWrapper: {
        borderColor: Colors.greyish,
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: Colors.greyish,
        shadowOpacity: 0.4,
        shadowRadius: 0,
        elevation: 3,
        backgroundColor: "rgba(255, 255, 255, 0.85)"
    },
    userAvatarChildren: {
        shadowColor: Colors.brownishGrey,
        shadowOpacity: 1,
        shadowRadius: 1,
        elevation: 2
    },
});
