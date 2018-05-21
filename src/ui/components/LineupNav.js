// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Navigation} from 'react-native-navigation';
import GImage from './GImage';
import type {User} from "../../types";
import {SFP_TEXT_MEDIUM} from "../fonts";
import {Colors} from "../colors";


type Props = {
    user: User,
    lineupName: string,
    lineupCount:? number,
};

type State = {
};

//TODO: merge with MyAvatar
export default class LineupNav extends Component<Props, State> {

    render() {

        let imageDim = 32;

        const user = this.props.user;

        const {lineupCount, lineupName} = this.props;
        return (
            <View style={{
                flex:1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'}
            }>
                <GImage
                    source={{uri: user && user.image || ""}}
                    style={{
                        height: imageDim,
                        width: imageDim,
                        borderRadius: imageDim / 2,
                    }}
                />
                <Text style={{
                    fontSize: 17,
                    fontFamily: SFP_TEXT_MEDIUM,
                    marginLeft: 8,
                }}>{_.upperFirst(lineupName)}
                    {

                        lineupCount > 0 && <Text style={{color: Colors.greyish}}>{` (${lineupCount})`}</Text>
                    }
                </Text>
            </View>
        )

    }
}
