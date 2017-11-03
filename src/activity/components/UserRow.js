// @flow

import type {Node} from 'react';
import React from 'react';


import {Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";
import type {User} from "../../types";

type Props = {
    user: User,
    children?: Node,
    small?: boolean,
    text?: string,
    style?: any
};

type State = {
};

export default class UserRow extends React.Component<Props, State> {

    render() {
        const {small, user, style} = this.props;

        let imageDim = small ? 20 : 30;


        return <View style={[style, {flex: 1, flexDirection: 'row'}]}>
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
                    <TouchableOpacity>
                        <Text style={{
                            fontSize: 11,
                            color: UI.Colors.blue
                        }}>{user ? `${user.firstName} ${user.lastName}` : ""}</Text>
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
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});