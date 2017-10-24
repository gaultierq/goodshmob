// @flow

import React from 'react';
import {Button, FlatList, Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import type {User} from "../../types";

class FriendCell extends React.Component {

    render() {
        let friend : User = this.props.friend;

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
                <Text>{`${friend.firstName} ${friend.lastName}`}</Text>
            </View>
        )
    }

}
export default FriendCell;
