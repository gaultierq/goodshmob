// @flow

import type {Node} from 'react';
import React from 'react';


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {User} from "../../../types";
import {Colors} from "../../colors";
import {CachedImage} from "react-native-img-cache";
import {SFP_TEXT_BOLD} from "../../fonts";
import GTouchable from "../../GTouchable";

type Props = {
    user: User,
    noImage?: boolean,
    children?: Node,
    rightComponent?: Node,
    rightText?: Node,
    small?: boolean,
    style?: any,
    onPressAvatar?: () => void,
};

type State = {
};

export default class UserRowI extends React.Component<Props, State> {

    render() {
        const {small, user, style, noImage, rightComponent, rightText, onPressAvatar} = this.props;

        let imageDim = small ? 20 : 30;

        let uri = user ? user.image: "";
        return <View style={[{flex:1, }, style, styles.userContainer]}>
            {
                !!uri &&
                !noImage &&

                <GTouchable
                    deactivated={!onPressAvatar}
                    onPress={onPressAvatar}>
                    <CachedImage
                        source={{uri}}
                        style={{
                            height: imageDim,
                            width: imageDim,
                            borderRadius: imageDim / 2,
                            marginRight: 8
                        }}
                    />
                </GTouchable>
            }

            <View style={{flex:1}}>
                <View style={[styles.rightContainer]}>
                    <Text style={styles.rightText}>
                        {user && user.firstName}
                        {rightText}
                    </Text>
                    {rightComponent}

                </View>

                {this.props.children}

            </View>

        </View>
    }

}

const styles = StyleSheet.create({
    userContainer: {alignItems: 'center', flexDirection: 'row'},
    rightContainer: {flexDirection: 'row'},
    rightText: {alignSelf: 'center', fontSize: 13, color: Colors.black, fontFamily: SFP_TEXT_BOLD}
});
