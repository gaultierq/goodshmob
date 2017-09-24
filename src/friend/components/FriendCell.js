// @flow

import React, {Component} from 'react';
import {StyleSheet, View, Text, Image, Button, TouchableOpacity, TouchableHighlight, FlatList} from 'react-native';
import * as Model from "../../models/index"
import i18n from '../../i18n/i18n'
import * as TimeUtils from '../../utils/TimeUtils'
import * as UI from "../../screens/UIStyles";
import * as activityAction from "../actions"
import {connect} from "react-redux";

class FriendCell extends React.Component {


    render() {
        let friend : Model.User = this.getFriend();

        return (
            <View style={{
                flex: 1, flexDirection: 'row', alignItems: 'center',
                backgroundColor: "transparent",
                margin: 10,
            }}>
                <Image
                    source={{uri: friend.image}}
                    style={{
                        height: 40,
                        width: 40,
                        borderRadius: 20,
                        marginRight: 10
                    }}
                />
                <Text>{Model.User.fullname(friend)}</Text>
            </View>
        )
    }

    getFriend() {
        return this.props.friend.all[this.props.friendId];
    }

    renderItem(item) {
        let it: Model.Saving = item.item;
        let image = it.resource ? it.resource.image : undefined;


        return <Image
            source={{uri: image}}
            style={{
                height: 40,
                width: 40,
                margin: 5
            }}
        />;
    }


}
const mapStateToProps = (state, ownProps) => ({
    friend: state.friend
});
export default connect(mapStateToProps)(FriendCell);
