// @flow

import type {Node} from 'react';
import React from 'react';


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {User} from "../../../types";
import {fullName} from "../../../helpers/StringUtils";
import {Colors} from "../../colors";
import GTouchable from "../../GTouchable";

type Props = {
    user: User,
    noImage?: boolean,
    children?: Node,
    rightComponent?: Node,
    small?: boolean,
    style?: any,
    navigator: *
};

type State = {
};

export default class UserRowI extends React.Component<Props, State> {

    render() {
        const {small, user, style, noImage} = this.props;

        let imageDim = small ? 20 : 30;

        let uri = user ? user.image: "";
        return <View style={[style, {alignItems: 'center', flexDirection: 'row'}]}>
            {
                !!uri && !noImage && <Image
                    source={{uri}}
                    style={{
                        height: imageDim,
                        width: imageDim,
                        borderRadius: imageDim / 2,
                        marginRight: 8
                    }}
                />
            }

            <View style={{flex: 1, width: '100%', height: 60}}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <GTouchable
                        onPress={()=>this.navigateToUser(user)}
                    >
                        <Text style={{
                            fontSize: 11,
                            color: Colors.blue
                        }}>{fullName(user)}</Text>
                    </GTouchable>
                    {this.props.rightComponent}


                </View>

                {this.props.children}

            </View>

        </View>
    }

    navigateToUser(user: User) {
        let navigator = this.props.navigator;

        navigator.push({
            screen: 'goodsh.UserScreen',
            title: fullName(user),
            passProps: {userId: user.id}
        });

    }
}
