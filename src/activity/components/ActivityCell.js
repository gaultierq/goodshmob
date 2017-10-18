// @flow

import React from 'react';
import {Image, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as UI from "../../screens/UIStyles";
import * as activityAction from "../actions"
import {connect} from "react-redux";
import {buildNonNullData} from "../../utils/DataUtils";
import * as types from "../actionTypes";
import ActivityDescription from "./ActivityDescription";
import type {Activity, ActivityType, Id, List, Url, Item} from "../../types"
import {saveItem} from "../../screens/actions";
import {Linking} from "react-native";

class ActivityCell extends React.Component {

    props: {
        data: any,
        activity: Activity,
        activityId: Id,
        activityType: ActivityType,
        navigator: any
    };

    render() {
        let activity = this.getActivity();

        //let activity: Model.Activity = this.props.activity;
        let resource = activity.resource;
        let target: Model.List = activity.target;
        let image = resource ? resource.image : undefined;

        let cardMargin = 12;
        let targetName;
        if (target) {
            let count = target.meta ? target.meta["savings-count"] : 0;
            targetName = target.name;
            if (count) targetName += " (" + count + ")"
        }
        let likesCount = activity.meta ? activity.meta["likes-count"] : 0;
        let commentsCount = activity.meta ? activity.meta["comments-count"] : 0;

        let goodshed = resource && resource.meta ? resource.meta["goodshed"] : false;

        return (
            <View style={{
                backgroundColor: "transparent",
                marginTop: 10,
                marginBottom: 10
            }}>
                {this.renderHeader(activity)}
                {/*card*/}
                <View style={Object.assign({}, UI.CARD(cardMargin))}>


                    {this.renderGoodshButton(image, likesCount, this.props.onPressItem)}


                    <View style={{padding: 15}}>
                        <Text style={{fontSize: 18, fontFamily: 'Chivo-Light',}}>{resource.title}</Text>
                        <Text style={{fontSize: 12, color: UI.Colors.grey2}}>{resource.subtitle}</Text>
                    </View>

                    <View style={{width: "100%", height: StyleSheet.hairlineWidth, backgroundColor: UI.Colors.grey1}}/>


                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingLeft: 10,
                        paddingRight: 10
                    }}>

                        {this.renderButton(require('../../img/comment.png'), i18n.t("activity_item.buttons.comment", {count: commentsCount}), () => this.comment(activity))}
                        {this.renderButton(require('../../img/send.png'), i18n.t("activity_item.buttons.share"), () => this.shareIntent(activity))}
                        {
                            goodshed ?
                                this.renderButton(require('../../img/save-icon.png'), i18n.t("activity_item.buttons.saved"), null, true)
                                :
                                this.renderButton(require('../../img/save-icon.png'), i18n.t("activity_item.buttons.save"), () => this.save(activity))
                        }
                        {this.renderButton(require('../../img/buy-icon.png'), i18n.t("activity_item.buttons.buy"), () => this.buy(activity))}

                    </View>

                </View>

            </View>
        )
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
                activity
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

    renderHeader(activity) {
        return <ActivityDescription activity={activity} />;
    }

    getActivity() {
        return buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }

    renderGoodshButton(image, likesCount, onActivityPressed) {
        let activity = this.getActivity();
        let liked = activity.meta && activity.meta["liked"];

        let goodshButtonColor = (this.isLiking() || this.isUnliking()) ? UI.Colors.grey1 : liked ? UI.Colors.green : UI.Colors.white;


        let imageHeight = 250;
        return <View style={{alignItems: 'center',}}>
            <TouchableHighlight
                onPress={onActivityPressed}
                style={{
                    alignSelf: 'center',
                    height: imageHeight+15,
                    width: "100%",
                }}>
                <Image
                    source={{uri: image}}
                    resizeMode='contain'
                    style={{
                        alignSelf: 'center',
                        height: imageHeight,
                        width: "100%",
                    }}
                />
            </TouchableHighlight>
            <TouchableHighlight
                onPress={this.onGoodshPressed.bind(this)}
                style={
                    {
                        backgroundColor : "white",
                        width: 60,
                        height: 30,
                        position: 'absolute',
                        bottom: 0,
                        borderRadius: 5,
                        padding: 2.5,

                    }
                }>

                <View
                    style={
                        {
                            width: "100%",
                            height: "100%",
                            borderRadius: 5,
                            backgroundColor : goodshButtonColor,
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            borderWidth: 0.5,
                            borderColor: '#d6d7da',
                            alignItems: 'center',
                            padding: 2.5,
                        }
                    }>
                    <Image source={require('../../img/mini-g-number.png')} resizeMode="contain"
                           style={{
                               width: 20,
                               height: 20,
                           }}
                    />
                    {!!likesCount && <Text style={{fontSize: 12, marginLeft: 3}}>{likesCount}</Text>}

                </View>
            </TouchableHighlight>

        </View>
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


    onGoodshPressed() {
        if (this.isLiking() || this.isUnliking()) return;

        let activity = this.getActivity();
        let {id, type} = activity;
        let alreadyLiked = activity.meta["liked"];
        let action = alreadyLiked ? activityAction.unlike : activityAction.like;
        this.props.dispatch(action(id, type));
    }

    isLiking() {
        return !!this.props.request.isLoading[types.LIKE.forId(this.props.activityId)];
    }

    isUnliking() {
        return !!this.props.request.isLoading[types.UNLIKE.forId(this.props.activityId)];
    }

}
const mapStateToProps = (state, ownProps) => ({
    // activity: state.activity,
    data: state.data,
    request: state.request,
});
export default connect(mapStateToProps)(ActivityCell);
