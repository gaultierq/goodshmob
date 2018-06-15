// @flow

import type {Node} from 'react';
import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {logged} from "../../../managers/CurrentUser"
import {buildNonNullData, getAskBackgroundColor, sanitizeActivityType} from "../../../helpers/DataUtils";
import type {Activity, ActivityType, Id, RNNNavigator} from "../../../types"
import ItemBody from "./ItemBody";
import ActivityActionBar from "./ActivityActionBar";
import {Avatar} from "../../UIComponents";
import {seeUser} from "../../Nav";
import GTouchable from "../../GTouchable";
import * as activityAction from "../actions";
import {A_BUY, canPerformAction, getPendingLikeStatus} from "../../rights"
import {SFP_TEXT_BOLD, SFP_TEXT_ITALIC} from "../../fonts";
import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors";
import User from "react-native-firebase/lib/modules/auth/User";
import {LINEUP_PADDING, stylePadding} from "../../UIStyles";
import {firstName} from "../../../helpers/StringUtils";
import ActivityStatus from "./ActivityStatus";
import FeedSeparator from "./FeedSeparator";
import {UpdateTracker} from "../../UpdateTracker";
import * as UI from "../../UIStyles"
import Button from 'apsl-react-native-button';
import Icon from 'react-native-vector-icons/Feather';


type Props = {
    data?: any,
    activity: Activity,
    activityId: Id,
    activityType: ActivityType,
    navigator: any,
    onPressItem: (any) => void,
    skipLineup?: boolean;
    skipDescription?: boolean;
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

    // refKeys: any;
    itemId: Id;
    updateTracker: UpdateTracker = new UpdateTracker(nextProps => this.makeRefObject(nextProps));


    render() {
        console.debug("ActivityCell rendered");
        let activity = this.getActivity();
        // this.refKeys = this.makeRefObject(this.props);
        this.updateTracker.onRender(this.props);

        if (sanitizeActivityType(activity.type) === 'asks') {
            return (
                <TouchableOpacity onPress={this.props.onPressItem} style={[_styles.askContent, {backgroundColor: getAskBackgroundColor(activity)}]}>
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

                </TouchableOpacity>
            )
        }

        return (
            <View>

                <View>

                    <ActivityStatus
                        activity={activity}
                        skipLineup={this.props.skipLineup}
                        descriptionNumberOfLines={3}
                        navigator={this.props.navigator}
                        cardStyle={{
                            paddingHorizontal: LINEUP_PADDING,
                            paddingVertical: 10,}}
                    />
                    <FeedSeparator/>

                    <GTouchable activeOpacity={0.9} onPress={this.props.onPressItem} onDoublePress={() => {
                        let liked = this.isLiked(activity);
                        const toggleLike = liked ? activityAction.unlike : activityAction.like;
                        this.props.dispatch(toggleLike(activity.id, activity.type));
                    }}>
                        {
                            activity.type === 'asks' ?
                                <Text style={{margin: 12, fontSize: 30}}>{activity.content}</Text>
                                :
                                <ItemBody
                                    item={activity.resource}
                                    liked={this.isLiked(activity)}
                                    navigator={this.props.navigator}
                                    bodyStyle={{
                                        padding: 23,
                                        paddingTop: 12,
                                    }}
                                    rightComponent={this.renderBuyButton(activity)}
                                />
                        }

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

    renderBuyButton(activity:Activity) {
        return canPerformAction(A_BUY, {activity}) /*new ActionRights(activity).canBuy()*/ && <Button
            onPress={() => {
                this.execBuy(activity)
            }}
            style={[{borderRadius: 10, backgroundColor: Colors.blue, borderWidth: 0}]}
        >
            <Icon name="shopping-cart" size={22} color={Colors.white} style={UI.stylePadding(10,1,10,1)}/>
            {/*<Text style={[UI.SIDE_MARGINS(10), {color: Colors.white, fontFamily: SFP_TEXT_MEDIUM, fontSize: 14}]}>

                i18n.t("actions.buy")
            </Text>*/}
        </Button>;
    }


    execBuy(activity: Activity) {
        let url = _.get(activity, 'resource.url');
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        });
    }

    renderDebugActivityInfo(activity: Activity) {
        return (
            <View>
                {/*{_.keys(activity).map(k => <Text style={{fontSize: 9}}>{`${k}=${activity[k]}`}</Text>)}*/}
                <Text>{JSON.stringify(activity,null,'\t')}</Text>
            </View>
        );
    }

    renderUserAvatar(user: User, styles?: *) {
        let navigator: RNNNavigator = this.props.navigator;
        return this.wrapUserAvatar(
            <GTouchable onPress={() => seeUser(navigator, user)}>
                <Avatar user={user} />
            </GTouchable>,
            styles
        )
    }

    // renderUserGeneral(user: User, user2?: User, style?:*) {
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

    // shouldComponentUpdate(nextProps: Props, nextState: State) {
    //     return __ENABLE_PERF_OPTIM__ || areEquals(this.refKeys, this.makeRefObject(nextProps));
    // }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return this.updateTracker.shouldComponentUpdate(nextProps);
    }

    makeRefObject(nextProps:Props) {
        const activityId = nextProps.activityId;

        let getRefKeys = (nextProps: Props) => {
            let activityType = sanitizeActivityType(nextProps.activityType);
            let base = `data.${activityType}.${nextProps.activityId}`;
            return [base, `${base}.meta`];
        };

        let result = getRefKeys(nextProps).map(k=>_.get(nextProps, k));
        let allPendings = _.values(_.get(nextProps, 'pending', {}));
        //[[create_ask1, create_ask2, ...], [create_comment1, create_comment2, ...], ...]

        let scopedPendings = [];
        _.reduce(allPendings, (res, pendingList) => {

            let filteredPendingList = _.filter(pendingList, pending => {
                const scope = _.get(pending, "options.scope");
                if (!scope) return false;
                return scope.activityId === activityId || scope.itemId === this.itemId;
            });

            res.push(...filteredPendingList);
            return res;
        }, scopedPendings);

        // if (scopedPendings.length > 0) {
        //     console.debug(`pending found for activity: ${activityId}: ${JSON.stringify(scopedPendings)}`);
        // }
        result.push(...scopedPendings);

        return result;
    }



    getActivity() {
        const result = this.props.activity || buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
        if (result && result.resource) {
            this.itemId = result.resource.id;
        }

        return result;
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
