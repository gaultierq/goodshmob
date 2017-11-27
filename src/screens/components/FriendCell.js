// @flow

import React from 'react';
import {Button, FlatList, Image, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import type {User} from "../../types";


type Props = {
    friend: User,
    children?: Node,
    childrenBelow?: boolean

};

type State = {
};

export default class FriendCell extends React.Component<Props, State> {

    render() {
        const {friend, children, childrenBelow} = this.props;

        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: "transparent",
                justifyContent: 'space-between',
                //borderWidth: 0.5,
                margin: 10,
            }}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: "transparent",
                    //borderWidth: 0.5,
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
                    <View style={childrenBelow ? {flex: 1}: {}}>
                        <Text>{`${friend.firstName} ${friend.lastName}`}</Text>
                        {childrenBelow && children}
                    </View>


                </View>
                <View>
                    {!childrenBelow && children}
                </View>
            </View>
        )
    }
}