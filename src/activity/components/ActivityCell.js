// @flow

import React from 'react';
import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as UI from "../../screens/UIStyles";
import * as activityAction from "../actions"
import {connect} from "react-redux";
import {buildNonNullData} from "../../utils/DataUtils";
import * as types from "../actionTypes";
import ActivityDescription from "./ActivityDescription";
import type {url} from "../../types"

class ActivityCell extends React.Component {

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

                        {this.renderButton(require('../../img/comment.png'), i18n.t("activity_item.buttons.comment", {count: commentsCount}))}
                        {this.renderButton(require('../../img/send.png'), i18n.t("activity_item.buttons.share"))}
                        {this.renderButton(require('../../img/save-icon.png'), i18n.t("activity_item.buttons.save"))}
                        {this.renderButton(require('../../img/buy-icon.png'), i18n.t("activity_item.buttons.buy"))}

                    </View>

                </View>

            </View>
        )
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
        return <View style={{alignItems: 'center',}}>
            <TouchableHighlight
                onPress={onActivityPressed}
                style={{
                    alignSelf: 'center',
                    height: 165,
                    width: "100%",
                }}>
                <Image
                    source={{uri: image}}
                    resizeMode='contain'
                    style={{
                        alignSelf: 'center',
                        height: 150,
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


    renderButton(img: url, text: string, handler: ()=>void) {
        return (<TouchableOpacity onPress={handler}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 6}}>

                    <Image source={img} style={{width: 16, height: 16, margin: 8, resizeMode: 'contain'}}/>
                    <Text style={{fontFamily: 'Chivo', textAlign: 'center', fontSize: 10}}>{text}</Text>

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
    activity: state.activity,
    data: state.data,
    request: state.request,
});
export default connect(mapStateToProps)(ActivityCell);
