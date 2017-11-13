// @flow

import type {Node} from 'react';
import React from 'react';


import {Image, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";
import type {User} from "../../types";

type Props = {
    user: User,
    children?: Node,
    small?: boolean,
    text?: string,
    style?: any,
    navigator: *
};

type State = {
};

export default class UserRow extends React.Component<Props, State> {

    render() {
        const {small, user, style} = this.props;

        let imageDim = small ? 20 : 30;

        return <View style={[style, {flexDirection: 'row'}]}>
            <Image
                source={{uri: user ? user.image: ""}}
                style={{
                    height: imageDim,
                    width: imageDim,
                    borderRadius: imageDim / 2
                }}
            />
            <View style={{flex: 1, marginLeft: 8}}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity
                        onPress={()=>this.navigateToUser(user)}
                    >
                        <Text style={{
                            fontSize: 11,
                            color: UI.Colors.blue
                        }}>{this.fullName(user)}</Text>
                    </TouchableOpacity>
                    {!!this.props.text &&
                    <Text style={{
                        fontSize: 9,
                        color: UI.Colors.grey1,
                        marginLeft: 4
                    }}>{this.props.text}
                    </Text>
                    }

                </View>

                {this.props.children}

            </View>

        </View>
    }


    fullName(user) {
        return user ? `${user.firstName} ${user.lastName}` : "";
    }

    navigateToUser(user) {
        let navigator = this.props.navigator;

        navigator.push({
            screen: 'goodsh.UserScreen',
            title: this.fullName(user),
            passProps: {userId: user.id}
        });

    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});