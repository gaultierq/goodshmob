// @flow

import React from 'react';

import {
    Image,
    Linking,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Alert
} from 'react-native';
import * as UI from "../../screens/UIStyles";
import type {Activity, Saving, Url} from "../../types";
import i18n from '../../i18n/i18n'
import {connect} from "react-redux";
import {currentGoodshboxId, currentUserId} from "../../CurrentUser";
import {unsave} from "../actions";
import Snackbar from "react-native-snackbar"
import {toUppercase} from "../../utils/StringUtils";

export type ActivityActionType = 'comment'| 'share'| 'save'| 'unsave'| 'see'| 'buy'| 'answer';
const ACTIONS = ['comment', 'share', 'save', 'unsave', 'see', 'buy', 'answer'];


type Props = {
    activity: Activity,
    navigator: any,
    actions?: Array<ActivityActionType>
};

type State = {
};

@connect()
export default class ActivityActionBar extends React.Component<Props, State> {


    render() {

        let activity = this.props.activity;

        //let activity: Model.Activity = this.props.activity;

        //let goodshed = resource && resource.meta ? savedIn : false;

        let buttons = ACTIONS.reduce((res, a) => {
            if (this.canExec(a)) {
                res.push(
                    this.renderButton(
                        this.renderImageButton(a),
                        this.renderTextButton(a, activity),
                        //$FlowFixMe
                        ()=>this['exec' + toUppercase(a)](activity)
                    )
                );
            }
            return res;
        },[]);


        return <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 10,
            paddingRight: 10
        }}>

            {buttons}

        </View>;
    }

    renderTextButton(action: ActivityActionType, activity: Activity) {
        let commentsCount = activity.comments ? activity.comments.length : 0;

        switch(action) {
            case 'comment':
                return i18n.t(`activity_item.buttons.${action}`,{count: commentsCount});
            case 'answer':
                return i18n.t(`activity_item.buttons.${action}`, {count: commentsCount});
        }
        return i18n.t(`activity_item.buttons.${action}`);
    }

    renderImageButton(action: ActivityActionType) {
        switch(action) {
            case 'comment':
                return require('../../img/comment.png')
            case 'share':
                return require('../../img/send.png')
            case 'save':
                return require('../../img/save-icon.png')
            case 'unsave':
                return require('../../img/save-icon.png')
            case 'see':
                return require('../../img/save-icon.png')
            case 'buy':
                return require('../../img/buy-icon.png')
            case 'answer':
                return require('../../img/comment.png')
        }
        throw "Unknown action: " +action
    }



    canExec(action: ActivityActionType) {
        let {actions, activity} = this.props;
        if ((actions || ACTIONS).indexOf(action) < 0) {
            return false;
        }

        let canCheck = this['can' + toUppercase(action)];

        if (canCheck) return canCheck.call(this, this.props.activity);

        let type = activity.type;


        switch(action) {
            case 'answer':
                return type === 'asks';
            case 'buy':
                return activity && activity.resource && activity.resource.url;
            case 'save':
            case 'comment':
            case 'share':
                return type !== 'asks';
        }

        return false;
    }

    canUnsave(activity: Activity) {
        return this.isGoodshed2(activity) && this.byMe(activity);
    }

    canSave(activity: Activity) {
        return !this.isGoodshed2(activity) && this.byMe(activity);
    }


    byMe(activity) {
        return activity.user.id === currentUserId();
    }

    isGoodshed2(activity) {
        let resource = activity.resource;
        let savedIn = _.get(resource, 'meta.saved-in', []);
        let target = activity.target;
        let goodshed;
        if (target && target.type === 'lists') {
            goodshed = _.indexOf(savedIn, target.id) > -1;
        }
        return goodshed;
    }

    renderButton(img: Url, text: string, handler: ()=>void, active:boolean = false) {
        let color = active ? UI.Colors.green: UI.Colors.black;
        return (<TouchableOpacity onPress={handler}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 6}}>

                    <Image source={img} style={{width: 16, height: 16, margin: 8, resizeMode: 'contain', tintColor: color}}/>
                    <Text style={{fontFamily: 'Chivo', textAlign: 'center', fontSize: 10, color: color}}>{text}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    execSave(activity: Activity) {

        let item = activity.resource;

        this.props.navigator.push({
            screen: 'goodsh.AddItemScreen', // unique ID registered with Navigation.registerScreen
            title: "Ajouter",
            passProps: {
                itemId: item.id,
                itemType: item.type,
                defaultLineupId: currentGoodshboxId(),
                onCancel: () => this.props.navigator.popToRoot(),
                onAdded: () => this.props.navigator.popToRoot(),
            },
        });

    }

    execUnsave(saving: Saving) {

        Alert.alert(
            '#Suppression',
            '#Êtes-vous sûr de vouloir effacer cet élément',
            [
                {text: '#Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: '#OK', onPress: () => {
                    console.log('OK Pressed');
                    this.props.dispatch(unsave(saving.id, saving.target.id)).then(() => {
                        console.info(`saving ${saving.id} unsaved`)
                        Snackbar.show({title: "#Goodsh effacé"});
                    });
                }
                },
            ],
            { cancelable: true }
        );


    }

    execComment(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: "Commentaires", // navigation bar title of the pushed screen (optional)
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
        let ios = Platform.OS === 'ios';
        let show = ios ? navigator.showLightBox : navigator.showModal;
        let hide = ios ? navigator.dismissLightBox : navigator.dismissModal;
        show({
            screen: 'goodsh.ShareScreen', // unique ID registered with Navigation.registerScreen
            style: {
                backgroundBlur: "light", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                tapBackgroundToDismiss: true // dismisses LightBox on background taps (optional)
            },
            passProps:{
                itemId: resource.id,
                itemType: resource.type,
                containerStyle: {backgroundColor: ios ? 'transparent' : 'white'},
                onClickClose: hide
            },
            navigatorStyle: {navBarHidden: true},
        });
    }

    execBuy(activity: Activity) {
        let url = activity.resource.url;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        });
    }


}

const styles = StyleSheet.create({
});