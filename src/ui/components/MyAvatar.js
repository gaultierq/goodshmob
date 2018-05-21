// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {currentUser, logged} from "../../managers/CurrentUser";
import {Navigation} from 'react-native-navigation';
import GTouchable from "../GTouchable";
import GImage from './GImage';
import {connect} from "react-redux";
import {currentUserFilter} from "../../redux/selectors";
import type {Id, User} from "../../types";


type Props = {
    userId: Id,
};

type State = {
};

export const PROFILE_CLICKED = 'PROFILE_NAV_CLICKED';

@logged
@connect((state, props)=>({
    currentUser: currentUserFilter(state, props)
}))
export default class MyAvatar extends Component<Props, State> {

    render() {

        let imageDim = 32;

        const user = _.get(this.props, 'currentUser.attributes')

        return (
            <GTouchable onPress={()=>{

                Navigation.handleDeepLink({
                    link: PROFILE_CLICKED,
                });

            }}>
                <GImage
                    source={{uri: user && user.image || ""}}
                    style={{
                        height: imageDim,
                        width: imageDim,
                        borderRadius: imageDim / 2,
                    }}
                    fallbackSource={require('../../img/avatar-missing.png')}
                />
            </GTouchable>
        )

    }
}
