// @flow

import type {Node} from 'react';
import React from 'react';


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {User} from "../../../types";
import {fullName} from "../../../helpers/StringUtils";
import {Colors} from "../../colors";
import {CachedImage} from "react-native-img-cache";

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
        const {small, user, style, noImage, rightComponent} = this.props;

        let imageDim = small ? 20 : 30;

        let uri = user ? user.image: "";
        return <View style={[{flex:1, }, style, styles.userContainer]}>
            {
                !!uri && !noImage && <CachedImage
                    source={{uri}}
                    style={{
                        height: imageDim,
                        width: imageDim,
                        borderRadius: imageDim / 2,
                        marginRight: 8
                    }}
                />
            }

            <View style={{flex:1}}>
                <View style={[styles.rightContainer]}>
                    <Text style={styles.rightText}>{fullName(user)}</Text>
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

const styles = StyleSheet.create({
    userContainer: {alignItems: 'center', flexDirection: 'row'},
    rightContainer: {flexDirection: 'row'},
    rightText: {alignSelf: 'center', fontSize: 13, color: Colors.greyishBrown, fontWeight: 'bold'}
});
