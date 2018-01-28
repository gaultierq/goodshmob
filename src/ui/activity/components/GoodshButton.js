// @flow

import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as activityAction from "../actions"
import type {Activity} from "../../../types"
import {connect} from "react-redux";
import {logged} from "../../../managers/CurrentUser"
import {Colors} from "../../colors";


type Props = {
    activity: Activity
};

type State = {
};

@connect()
@logged
export default class GoodshButton extends React.Component<Props, State>  {

    render() {
        let activity = this.getActivity();
        let likesCount = activity.meta ? activity.meta["likesCount"] : 0;
        let liked = activity.meta && activity.meta["liked"];
        let goodshButtonColor = (this.isLiking() || this.isUnliking()) ? Colors.greyishBrown : liked ? Colors.green : Colors.white;

        return (
            <TouchableHighlight
                onPress={this.onGoodshPressed.bind(this)}
                style={styles.container}>
                <View style={styles.goodshButton}>
                    <Image source={liked ? require('../../../img/yeah_on.png') : require('../../../img/yeah_off.png')} resizeMode="contain"/>
                    {!!likesCount && <Text style={styles.buttonText}>{likesCount}</Text>}
                </View>
            </TouchableHighlight>
        )
    }


    getActivity() {
        return this.props.activity;
        //return buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
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
        //FIXME: use local state
        return false;//!!this.props.request.isLoading[types.LIKE.forId(this.props.activityId)];
    }

    isUnliking() {
        //FIXME: use local state
        return false;//!!this.props.request.isLoading[types.UNLIKE.forId(this.props.activityId)];
    }

}
// const mapStateToProps = (state, ownProps) => ({
//     data: state.data,
// });


const styles = StyleSheet.create({
    container: {
        width: 80,
        position: 'absolute',
        bottom: 0,
    },
    goodshButton: {
        width: "100%",
        height: "100%",
        borderRadius: 5,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        position: 'absolute',
        right: 8,
        fontSize: 12,
        marginLeft: 3
    }
});
