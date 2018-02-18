// @flow

import React from 'react';

import {Alert, Image, Linking, Platform, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {Activity, ActivityType, Id, Saving, Url} from "../../../types";
import {connect} from "react-redux";
import {currentGoodshboxId, logged} from "../../../managers/CurrentUser"
import * as activityAction from "../actions";
import {unsave} from "../actions";
import {toUppercase} from "../../../helpers/StringUtils";
import {buildData, buildNonNullData, sanitizeActivityType} from "../../../helpers/DataUtils";
import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors";
import ActionRights, {getPendingLikeStatus} from "../../rights";
import {CREATE_COMMENT} from "../../screens/comments";
import GTouchable from "../../GTouchable";
import * as Nav from "../../Nav";
import {SAVING_CREATION, doUnsave} from "../../lineup/actions";
import StoreManager from "../../../managers/StoreManager";
import Messenger from "../../../managers/Messenger";

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
                        this.renderImageButton(a),
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
                let commentsCount = activity.comments ? activity.comments.length : 0;
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



    renderImageButton(action: ActivityActionType) {
        switch(action) {
            case 'comment':
                return require('../../../img2/commentIcon.png');
            case 'like':
                return require('../../../img2/yeaahIcon.png');
            case 'unlike':
                return require('../../../img2/yeaahIcon.png');
            case 'share':
                return require('../../../img2/sendIcon.png');
            case 'save':
                return require('../../../img2/bookmarkIcon.png');
            case 'unsave':
                return require('../../../img2/bookmarkIcon.png');
            case 'see':
                return require('../../../img/save-icon.png');
            case 'buy':
                return require('../../../img/buy-icon.png');
            case 'answer':
                return require('../../../img2/commentIcon.png');
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
        return new ActionRights(activity).canUnsave();
    }

    canSave(activity: Activity) {
        return new ActionRights(activity).canSave();
    }

    canLike(activity: Activity) {
        let pendingLike = this.getPendingLikeStatus(activity);
        return pendingLike ? pendingLike === -1 : new ActionRights(activity).canLike();
    }

    canUnlike(activity: Activity) {
        let pendingLike = this.getPendingLikeStatus(activity);
        return pendingLike ? pendingLike === 1 : new ActionRights(activity).canUnlike();
    }

    canBuy(activity: Activity) {
        return new ActionRights(activity).canBuy();
        // let resource = activity.resource;
        // return resource && sanitizeActivityType(resource.type) === 'creativeWorks';
        //return _.get(activity, 'resource.type') === 'creativeWorks';
    }



    renderButton(key: string, img: Url, text: string, handler: ()=>void, active:boolean = false) {
        let color = active ? Colors.green: Colors.greyishBrown;
        return (<GTouchable onPress={handler} key={key}>
                <View style={styles.button}>
                    <Image source={img} style={[styles.buttonImage, {tintColor: color}]}/>
                    <Text style={[styles.buttonText, {color: color}]}>{text}</Text>
                </View>
            </GTouchable>
        );
    }

    execSave(activity: Activity) {

        let item = activity.resource;

        //1st: save in goodshbox. and no more !
        this.props.dispatch(SAVING_CREATION.pending({
            itemId: item.id,
            lineupId: currentGoodshboxId(),
            privacy: 0,
            description: ''
        })).then(pendingId => {
            //console.info(`saving ${saving.id} unsaved`)
            Messenger.sendMessage(
                //MagicString
                i18n.t("activity_action_bar.goodsh_bookmarked", {lineup: "Goodshbox"}),
                {action: {
                    title: i18n.t('activity_action_bar.goodsh_bookmarked_change_lineup'),
                    onPress: () => {
                        //undo previous add
                        SAVING_CREATION.undo(pendingId);
                        let item = activity.resource;

                        // this.props.navigator.showModal({
                        //     screen: 'goodsh.AddItemScreen', // unique ID registered with Navigation.registerScreen
                        //     passProps: {
                        //         itemId: item.id,
                        //         itemType: item.type,
                        //         defaultLineupId: currentGoodshboxId(),
                        //         // onCancel: () => this.props.navigator.popToRoot(),
                        //         // onAdded: () => this.props.navigator.popToRoot(),
                        //     },
                        // });

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


            Alert.alert(
                i18n.t("alert.delete.title"),
                i18n.t("alert.delete.label"),
                [
                    {text: i18n.t("actions.cancel"), onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                    {text: i18n.t("actions.ok"), onPress: () => {
                        let saving = _.head(savings);
                        let {id, lineupId, pending} = saving;
                        let lineup;
                        if (pending) {
                            lineup = buildData(this.props.data, 'lists', lineupId)
                        }
                        else {
                            lineup = _.get(buildData(this.props.data, 'savings', id), 'target');
                        }
                        lineupId = lineup && lineup.id;
                        this.props.dispatch(doUnsave(saving.pending, saving.id, lineupId)).then(() => {
                            //console.info(`saving ${saving.id} unsaved`)
                            Messenger.sendMessage(i18n.t("activity_action_bar.goodsh_deleted"));
                        });

                        // //console.log('OK Pressed');
                        // this.props.dispatch(unsave(saving.id, saving.target.id)).then(() => {
                        //     //console.info(`saving ${saving.id} unsaved`)
                        //     Snackbar.show({title: i18n.t("activity_action_bar.goodsh_deleted")});
                        // });
                    }
                    },
                ],
                { cancelable: true }
            );


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
                autofocus: true
            },
            navigatorButtons: Nav.CANCELABLE_MODAL,
        });
    }

    execAnswer(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen',
            title: i18n.t("activity_action_bar.response.title"),
            passProps: {
                activityId: activity.id,
                activityType: activity.type
            },
        });
    }

    execShare(activity: Activity) {
        const {resource} = activity;

        let navigator = this.props.navigator;

        //TODO: rm platform specific rules when [1] is solved.
        //1: https://github.com/wix/react-native-navigation/issues/1502
        navigator.showModal({
            screen: 'goodsh.ShareScreen', // unique ID registered with Navigation.registerScreen
            animationType: 'none',
            style: {
                backgroundBlur: "light", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                tapBackgroundToDismiss: true // dismisses LightBox on background taps (optional)
            },
            passProps:{
                itemId: resource.id,
                itemType: resource.type,
                containerStyle: {backgroundColor: __IS_IOS__ ? 'transparent' : Colors.white},
                onClickClose: () => navigator.dismissModal({animationType: 'none',})
            },
            navigatorStyle: {navBarHidden: true},
        });
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
