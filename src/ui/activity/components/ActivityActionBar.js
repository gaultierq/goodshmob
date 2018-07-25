// @flow

import React from 'react'

import {Alert, Image, Linking, Platform, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import type {Activity, ActivityType, Color, Id, Saving} from "../../../types"
import {connect} from "react-redux"
import {currentGoodshboxId, isCurrentUser, logged} from "../../../managers/CurrentUser"
import * as activityAction from "../actions"
import {unsave} from "../actions"
import {fullName, toUppercase} from "../../../helpers/StringUtils"
import {buildData, sanitizeActivityType} from "../../../helpers/DataUtils"
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import {default as FeatherIcon} from 'react-native-vector-icons/Feather'
import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors"
import {
    A_BUY,
    A_LIKE,
    A_SAVE,
    A_UNLIKE,
    A_UNSAVE,
    ActivityRights,
    canPerformAction,
    getPendingLikeStatus
} from "../../rights"
import {CREATE_COMMENT} from "../../screens/comments"
import GTouchable from "../../GTouchable"
import * as Nav from "../../Nav"
import {displayShareItem} from "../../Nav"
import {CREATE_SAVING, doUnsave, SAVING_DELETION} from "../../lineup/actions"
import StoreManager from "../../../managers/StoreManager"
import _Messenger from "../../../managers/Messenger"
import {SFP_TEXT_MEDIUM} from "../../fonts"
import {LINEUP_PADDING} from "../../UIStyles"

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

        let activity = buildData(this.props.data, this.props.activityType, this.props.activityId);

        //let activity: Model.Activity = this.props.activity;

        let ar = new ActivityRights(activity);


        let leftButtons = this.getButtons(['comment', 'answer', 'like', 'unlike', 'share'], activity);

        let rightButtons
        if (ar.canSave()) {
            rightButtons = (
                <GTouchable onPress={()=> {
                    this.execSave(activity)
                }} style={[styles.saveButtonContainer, {backgroundColor: Colors.green}]}>
                    <Image style={[styles.saveButtonIcon]} source={require('../../../img2/save-icon.png')}/>
                    <Text style={[styles.saveButtonText, {color: Colors.white}]}>{i18n.t('actions.save')}</Text>
                </GTouchable>
            )
        }
        else if (ar.canUnsave()) {
            const grey11 = Colors.greyish
            rightButtons = (
                <GTouchable onPress={()=> {
                    this.execUnsave(activity)
                }} style={[styles.saveButtonContainer, {borderColor: "#cacaca", borderWidth: 1}]}>
                    <Image style={[styles.saveButtonIcon]} source={require('../../../img2/save-fill.png')}/>
                    <Text style={[styles.saveButtonText, {color: grey11}]}>{i18n.t('actions.unsave')}</Text>
                </GTouchable>
            )
        }





        return (
            <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingRight: LINEUP_PADDING,
                backgroundColor: ACTIVITY_CELL_BACKGROUND,
                // backgroundColor: 'red',
                justifyContent: 'space-between',
            }}>
                <View style={styles.actionBar}>{leftButtons}</View>
                <View style={[styles.actionBar]}>{rightButtons}</View>
            </View>)
    }

    getButtons(possibleActions, activity) {
        return possibleActions.reduce((res, a) => {
            if (this.canExec(a, activity)) {
                res.push(
                    this.renderButton(
                        a,
                        this.getButtonText(a, activity),
                        //$FlowFixMe
                        () => this['exec' + toUppercase(a)](activity),
                        a === 'unlike' || a === 'unsave'
                    )
                )
            }
            return res
        }, [])
    }

    getButtonText(action: ActivityActionType, activity: Activity) {


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


    renderImageIcon(action: ActivityActionType, size: number, color: Color, style?: any) {
        switch(action) {
            case 'comment':
                return <Image style={[style, {tintColor: color}]} source={require('../../../img2/comment-icon.png')} />
                // return <FontAwesome style={style} name={'comment-o'} size={size} color={color}/>
            case 'like':
                return <Image style={[style, {tintColor: color}]} source={require('../../../img2/heart.png')} />
                // return <FontAwesome style={style} name={'heart-o'} size={size} color={color}/>
            case 'unlike':
                return <Image style={[style, {tintColor: color}]} source={require('../../../img2/heart-green.png')} />
                // return <FontAwesome style={style} name={'heart'} size={size} color={color}/>
            case 'share':
                return <Image style={[style, {tintColor: color}]} source={require('../../../img2/share-small.png')}/>
                // if (__IS_IOS__) {
                //     return <FeatherIcon style={style} name={'share'} size={size} color={color}/>
                // }
                // return <MaterialIcon style={style} name={'share'} size={size} color={color}/>
            case 'save':
                return <FontAwesome style={style} name={'bookmark-o'} size={size} color={color}/>
            case 'unsave':
                return <FontAwesome style={style} name={'bookmark'} size={size} color={color}/>
            case 'see':
                return <MaterialIcon style={style} name={'playlist_add'} size={size} color={color}/>
            case 'buy':
                return <MaterialIcon style={style} name={'shopping_cart'} size={size} color={color}/>
            case 'answer':
                return <FontAwesome style={style} name={'comments-o'} size={size} color={color}/>
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



    renderButton(action: ActivityActionType, text: string, handler: ()=>void, active:boolean = false) {
        let color = active ? Colors.green: Colors.greyishBrown;
        return (<GTouchable onPress={handler} key={action}>
                <View style={styles.button}>
                    {this.renderImageIcon(action, 24, color, styles.buttonImage)}
                    <Text style={[styles.buttonText, {color}]}>{text}</Text>
                </View>
            </GTouchable>
        );
    }

    execSave(activity: Activity) {

        let item = activity.resource;

        const user = activity.user;

        let description = isCurrentUser(user) ? "" : "via " +  fullName(user) + (activity.description ? (" - " + activity.description) : "");
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
        // flex: 1,
        flexDirection: 'row',
        // justifyContent: 'space-between',
        // paddingLeft: 10,
        // paddingRight: 10,
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
        margin: 8,
    },
    buttonText: {
        textAlign: 'center',
        fontSize: 15
    },

    saveButtonContainer: {
        flexDirection: 'row',
        borderRadius: 4,
        height: 33,
        alignItems: 'center',
        paddingHorizontal: 4 * 2,
    },
    saveButtonText: {
        fontSize: 14,
        marginHorizontal: 4,
        fontFamily: SFP_TEXT_MEDIUM,
    },
    saveButtonIcon: {
        width: 8,
        marginHorizontal: 4
    }
});
