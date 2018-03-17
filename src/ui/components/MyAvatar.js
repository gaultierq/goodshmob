// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {currentUser} from "../../managers/CurrentUser";
import {Navigation} from 'react-native-navigation';
import GTouchable from "../GTouchable";
import {CachedImage} from "react-native-img-cache";


type Props = {
};

type State = {
};

export const PROFILE_CLICKED = 'PROFILE_NAV_CLICKED';


export default class MyAvatar extends Component<Props, State> {

    render() {

        let imageDim = 32;

        const user = currentUser(false);

        return (
            <GTouchable onPress={()=>{

                Navigation.handleDeepLink({
                    link: PROFILE_CLICKED,
                });

            }}>
                <CachedImage
                    source={{uri: user && user.image || ""}}
                    style={{
                        height: imageDim,
                        width: imageDim,
                        borderRadius: imageDim / 2,
                    }}
                />
            </GTouchable>
        )

    }
}
