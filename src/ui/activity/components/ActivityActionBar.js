// @flow

import React from 'react';

import {Alert, Image, Linking, Platform, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {Activity, ActivityType, Id, Item, Saving, Url, User} from "../../../types";
import {connect} from "react-redux";
import {currentGoodshboxId, isCurrentUser, logged} from "../../../managers/CurrentUser"
import * as activityAction from "../actions";
import {unsave} from "../actions";
import {fullName, toUppercase} from "../../../helpers/StringUtils";
import {buildData, buildNonNullData, sanitizeActivityType} from "../../../helpers/DataUtils";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {default as FeatherIcon} from 'react-native-vector-icons/Feather';

import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors";
import {canPerformAction, getPendingLikeStatus, A_BUY, A_SAVE, A_UNLIKE, A_UNSAVE, A_LIKE} from "../../rights";
import {CREATE_COMMENT} from "../../screens/comments";
import GTouchable from "../../GTouchable";
import * as Nav from "../../Nav";
import {CREATE_SAVING, doUnsave, SAVING_DELETION} from "../../lineup/actions";
import StoreManager from "../../../managers/StoreManager";
import _Messenger from "../../../managers/Messenger";
import Config from "react-native-config";
import ItemCell from "../../components/ItemCell";
import type {Description, Visibility} from "../../screens/save";
import * as Api from "../../../managers/Api";
import ApiAction from "../../../helpers/ApiAction";
import {displayShareItem} from "../../Nav";

export type ActivityActionType = 'comment'| 'like'| 'unlike'| 'share'| 'save'| 'unsave'| 'see'| 'buy'| 'answer';
const ACTIONS = ['comment', 'like', 'unlike','share', 'save', 'unsave', 'see', 'buy', 'answer'];


type Props = {
    activityId: Id,
    activityType: ActivityType,
    navigator: any,
    actions?: Array<ActivityActionType>,
    blackList?: Array<ActivityActionType>,
};

type State = {
};

//TODO: perfs
@logged
@connect(state => ({
    data: state.data,
    pending: state.pending
}))
export default class ActivityActionBar extends React.Component<Props, State> {


    render() {

        let activity = buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);

        //let activity: Model.Activity = this.props.activity;


        const possibleActions = ['comment', 'like', 'unlike', 'share', 'save', 'unsave', 'see', 'answer'];

        let buttons = possibleActions.reduce((res, a) => {
            if (this.canExec(a, activity)) {
                res.push(
                    this.renderButton(
                        a,
                        this.renderImageIcon(a),
                        this.renderTextButton(a, activity),
                        //$FlowFixMe
                        ()=>this['exec' + toUppercase(a)](activity),
                        a === 'unlike' || a === 'unsave'
                    )
                );
            }
            return res;
        },[]);


        return <View style={styles.actionBar}>{buttons}</View>;
    }

    renderTextButton(action: ActivityActionType, activity: Activity) {


        switch(action) {
            case 'comment':
                // let commentsCount = activity.comments ? activity.comments.length : 0;
                let commentsCount = _.get(activity, 'meta.commentsCount',  0);
                let pendingCount = _.filter(this.props.pending[CREATE_COMMENT], (o) => o.payload.activityId === activity.id).length;

                commentsCount += pendingCount;

                return commentsCount > 0 ? commentsCount +'' : '';
            // return i18n.t(`activity_item.buttons.${action}`,{count: commentsCount});
            case 'like':
            case 'unlike':
                let pendingLike = this.getPendingLikeStatus(activity);


                //TODO: use instedAt and improve sequence
                let likesCount = activity.meta ? activity.meta["likesCount"] : 0;
                likesCount += pendingLike;

                return likesCount > 0 ? likesCount +'' : '';
            case 'answer':
                let answersCount = activity.answersCount || 0;
                return answersCount + '';//i18n.t(`activity_item.buttons.${action}`, {count: answersCount});

        }
        return '';//i18n.t(`activity_item.buttons.${action}`);
    }

    getPendingLikeStatus(activity) {
        return getPendingLikeStatus(this.props.pending, activity);
    }



    renderImageIcon(action: ActivityActionType) {

        switch(action) {
            case 'comment':
                return {iconName: 'comment', useFeather: false};
            case 'like':
                return {iconName: 'favorite', useFeather: false};
            case 'unlike':
                return {iconName: 'favorite', useFeather: false};
            case 'share':
                return __IS_IOS__ ? {iconName: 'share', useFeather: true} : {iconName: 'share', useFeather: false};
            case 'save':
                return {iconName: 'bookmark_border', useFeather: false};
            case 'unsave':
                return {iconName: 'bookmark_border', useFeather: false};
            case 'see':
                return {iconName: 'playlist_add', useFeather: false};
            case 'buy':
                return {iconName: 'shopping_cart', useFeather: false};
            case 'answer':
                return {iconName: 'mode_comment', useFeather: false};
        }
        throw "Unknown action: " +action
    }



    canExec(action: ActivityActionType, activity: Activity) {
        let {actions, blackList} = this.props;
        if ((actions || ACTIONS).indexOf(action) < 0) {
            return false;
        }

        if (blackList && blackList.indexOf(action) >= 0) return false;

        let canCheck = this['can' + toUppercase(action)];

        if (canCheck) return canCheck.call(this, activity);

        let type = activity.type;


        switch(action) {
            case 'answer':
                return this.isAsk(activity);
            case 'buy':
                return activity && activity.resource && activity.resource.url;
            case 'save':
            case 'comment':
            case 'share':
                return !this.isAsk(activity);
        }

        return false;
    }

    isAsk(activity: Activity) {
        return sanitizeActivityType(activity.type) === 'asks';
    }

    canUnsave(activity: Activity) {
        return canPerformAction(A_UNSAVE, {activity})
    }

    canSave(activity: Activity) {
        return canPerformAction(A_SAVE, {activity})
    }

    canLike(activity: Activity) {
        let pendingLike = this.getPendingLikeStatus(activity);
        return pendingLike ? pendingLike === -1 : canPerformAction(A_LIKE, {activity})
    }

    canUnlike(activity: Activity) {
        let pendingLike = this.getPendingLikeStatus(activity);
        return pendingLike ? pendingLike === 1 : canPerformAction(A_UNLIKE, {activity})
    }

    canBuy(activity: Activity) {
        return canPerformAction(A_BUY, {activity})
    }



    renderButton(key: string, iconConfig: Object, text: string, handler: ()=>void, active:boolean = false) {
        let color = active ? Colors.green: Colors.greyishBrown;
        let {iconName, useFeather} = iconConfig;

        return (<GTouchable onPress={handler} key={key}>
                <View style={styles.button}>
                    {useFeather && <FeatherIcon
                        style={[styles.buttonImage, {tintColor: color}]}
                        name={iconName} size={24} color={Colors.brownishGrey}/>}
                    {!useFeather && <Icon
                        style={[styles.buttonImage, {tintColor: color}]}
                        name={iconName} size={24} color={Colors.brownishGrey}/>}
                    <Text style={[styles.buttonText, {color: color}]}>{text}</Text>
                </View>
            </GTouchable>
        );
    }

    execSave(activity: Activity) {

        let item = activity.resource;

        const user = activity.user;

        let description = isCurrentUser(user) ? "" : "via " +  fullName(user) + (activity.description && " - " + activity.description);
        const delayMs = 4000;

        const lineupId = currentGoodshboxId();
        this.props.dispatch(CREATE_SAVING.pending({
                itemId: item.id,
                itemType: item.type,
                lineupId,
                privacy: 0,
                description,
            }, {
                scope: {itemId: item.id, lineupId},
                lineupId: lineupId,
                delayMs: delayMs
            }
        )).then(pendingId => {
            //console.info(`saving ${saving.id} unsaved`)

            _Messenger.sendMessage(
                //MagicString
                i18n.t("activity_action_bar.goodsh_bookmarked", {lineup: "Goodshbox"}),
                {
                    timeout: delayMs,
                    action: {
                        title: i18n.t('activity_action_bar.goodsh_bookmarked_change_lineup'),
                        onPress: () => {
                            //undo previous add
                            console.info(`changing lineup: undo-ing pending=${pendingId}`);
                            this.props.dispatch(CREATE_SAVING.undo(pendingId));

                            let item = activity.resource;

                            let cancel = () => {
                                this.props.navigator.dismissModal()
                            };
                            this.props.navigator.showModal({
                                screen: 'goodsh.AddItemScreen',
                                title: i18n.t("add_item_screen.title"),
                                animationType: 'none',
                                passProps: {
                                    itemId: item.id,
                                    itemType: item.type,
                                    item,
                                    defaultLineupId: currentGoodshboxId(),
                                    defaultDescription: description,
                                    onCancel: cancel,
                                    onAdded: cancel,
                                },
                            });

                        },
                    }}
            );
        });


    }

    // execUnsave(remoteSaving: Saving) {
    //     let resource = remoteSaving.resource;
    //     let savedIn = _.get(resource, 'meta.savedIn', []);
    //     let saving, lineup;
    //     //one of the list where this item is saved
    //     let lineupId = _.head(savedIn);
    //     if (lineupId) {
    //         lineup = buildData(this.props.data, 'lists', lineupId);
    //         if (lineup) {
    //             if (lineup.savings) {
    //
    //                 if (lineup) {
    //                     saving = _.head(lineup.savings.filter(s =>_.get(s, 'resource.id') ===  resource.id));
    //                 }
    //             }
    //             else {
    //                 console.warn(`No savings in this linenup: ${JSON.stringify(lineup)}`);
    //             }
    //         }
    //         else {
    //             console.warn(`lineup not in cache: ${lineupId}`);
    //         }
    //     }
    //
    //     if (!saving) {
    //         sendMessage(i18n.t('common.api.generic_error'));
    //         return;
    //     }
    //
    //     Alert.alert(
    //         i18n.t("alert.delete.title"),
    //         i18n.t("alert.delete.label"),
    //         [
    //             {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
    //             {text: i18n.t("actions.ok"), onPress: () => {
    //                 //console.log('OK Pressed');
    //                 this.props.dispatch(unsave(saving.id, saving.target.id)).then(() => {
    //                     //console.info(`saving ${saving.id} unsaved`)
    //                     Snackbar.show({title: i18n.t("activity_action_bar.goodsh_deleted")});
    //                 });
    //             }
    //             },
    //         ],
    //         { cancelable: true }
    //     );
    // }

    execUnsave(remoteSaving: Saving) {
        let resource = remoteSaving.resource;
        let {id, type} = resource;
        let savings = StoreManager.getMySavingsForItem(id, type);
        if (_.size(savings) === 1) {

            let saving = _.head(savings);
            const dispatch = this.props.dispatch;

            unsaveOnce(saving, dispatch);


        }
        else {
            this.props.navigator.showModal({
                screen: 'goodsh.UnsaveScreen',
                title: i18n.t("actions.unsave"),
                passProps: {
                    itemId: resource.id,
                    itemType: resource.type
                },
                navigatorButtons: Nav.CANCELABLE_MODAL,
            });
        }


    }


    execComment(activity: Activity) {
        this.props.navigator.showModal({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: i18n.t("activity_action_bar.comment.title"), // navigation bar title of the pushed screen (optional)
            passProps: {
                activityId: activity.id,
                activityType: activity.type,
                autoFocus: true
            },
            navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }

    execAnswer(activity: Activity) {
        this.props.navigator.showModal({
            screen: 'goodsh.CommentsScreen',
            title: i18n.t("activity_action_bar.response.title"),
            passProps: {
                activityId: activity.id,
                activityType: activity.type
            },
            navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }

    execShare(activity: Activity) {
        displayShareItem(this.props.navigator, activity)
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

    execLike(activity: Activity) {
        let {id, type} = activity;
        this.props.dispatch(activityAction.like(id, type));
    }

    execUnlike(activity: Activity) {
        let {id, type} = activity;
        this.props.dispatch(activityAction.unlike(id, type));
    }
}



export function unsaveOnce(saving: Saving, dispatch: *) {
    Alert.alert(
        i18n.t("alert.delete.title"),
        i18n.t("alert.delete.label"),
        [
            {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            {
                text: i18n.t("actions.ok"), onPress: () => {
                    let {id, lineupId, pending} = saving;
                    let lineup;
                    if (pending) {
                        lineup = StoreManager.buildData('lists', lineupId)
                    }
                    else {
                        lineup = _.get(StoreManager.buildData('savings', id), 'target');
                    }
                    lineupId = lineup && lineup.id;
                    const delayMs = 4000;

                    dispatch(doUnsave(saving.pending, saving.id, lineupId, delayMs)).then((pendingId) => {
                        //console.info(`saving ${saving.id} unsaved`)
                        _Messenger.sendMessage(
                            i18n.t("activity_action_bar.goodsh_deleted"),
                            {
                                timeout: delayMs,
                                action: !pending && {
                                    title: i18n.t('activity_action_bar.goodsh_deleted_undo'),
                                    onPress: () => {
                                        //undo previous add
                                        dispatch(SAVING_DELETION.undo(pendingId))
                                    },
                                }
                            }
                        );
                    });
                }
            },
        ],
        {cancelable: true}
    );
}


const styles = StyleSheet.create({
    actionBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: ACTIVITY_CELL_BACKGROUND,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6
    },
    buttonImage: {
        width: 24,
        height: 24,
        margin: 8,
        resizeMode: 'contain'
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 15
    }
});
