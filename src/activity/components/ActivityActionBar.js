// @flow

import React from 'react';

import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";
import type {Activity, Item, List, Url} from "../../types";
import i18n from '../../i18n/i18n'
import {saveItem} from "../../screens/actions";
import * as _ from "lodash";

export type ActivityActionType = 'comment' | 'share' | 'save' | 'buy';
const ACTIONS = ['comment', 'share', 'save', 'buy'];

export default class ActivityActionBar extends React.Component {

    props: {
        activity: Activity,
        navigator: any,
        actions?: Array<ActivityActionType>
    };


    render() {

        let activity = this.props.activity;

        //let activity: Model.Activity = this.props.activity;
        let resource = activity.resource;

        let commentsCount = activity.comments ? activity.comments.length : 0;

        let goodshed = resource && resource.meta ? resource.meta["goodshed"] : false;

        const actions : Array<ActivityActionType> = this.props.actions || ACTIONS;

        return <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 10,
            paddingRight: 10
        }}>

            {actions.indexOf('comment') >= 0 && this.renderButton(require('../../img/comment.png'), i18n.t("activity_item.buttons.comment", {count: commentsCount}), () => this.comment(activity))}

            {actions.indexOf('share') >= 0 && this.renderButton(require('../../img/send.png'), i18n.t("activity_item.buttons.share"), () => this.shareIntent(activity))}
            {
                goodshed ?
                    actions.indexOf('save') >= 0 && this.renderButton(require('../../img/save-icon.png'), i18n.t("activity_item.buttons.saved"), null, true)
                    :
                    actions.indexOf('save') >= 0 && this.renderButton(require('../../img/save-icon.png'), i18n.t("activity_item.buttons.save"), () => this.save(activity))
            }
            {actions.indexOf('buy') >= 0 && this.renderButton(require('../../img/buy-icon.png'), i18n.t("activity_item.buttons.buy"), () => this.buy(activity))}

        </View>;
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

    save(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.LineupListScreen', // unique ID registered with Navigation.registerScreen
            title: "Sauvegarder" + activity.resource.title, // navigation bar title of the pushed screen (optional)
            passProps: {
                activity,
                canFilterOverItems: false,
                onLineupPressed: (lineup: List)=> this.saveResourceInList(activity.resource, lineup)
            },
        });
    }

    saveResourceInList(item: Item, lineup: List) {
        this.props.dispatch(saveItem(item.id, lineup.id)).then(()=>{
            setTimeout(()=>this.props.navigator.pop(), 1000);
        });
    }

    comment(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: "Commentaires", // navigation bar title of the pushed screen (optional)
            passProps: {
                activityId: activity.id,
                activityType: activity.type
            },
        });
    }

    shareIntent(activity: Activity) {
        Share.share({
            message: 'BAM: we\'re helping your business with awesome React Native apps',
            url: 'http://bam.tech',
            title: 'Wow, did you see that?'
        }, {
            // Android only:
            dialogTitle: 'Share BAM goodness',
            // iOS only:
            excludedActivityTypes: [
                'com.apple.UIKit.activity.PostToTwitter'
            ]
        })
    }

    buy(activity: Activity) {
        let resource = activity.resource;
        let url = resource.url;
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
    container: {
        flex: 1,
    },
});