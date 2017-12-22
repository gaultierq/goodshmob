// @flow
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {currentUser} from "../../managers/CurrentUser";
import {Navigation} from 'react-native-navigation';

type Props = {
};

type State = {
};

export const PROFILE_CLICKED = 'PROFILE_NAV_CLICKED';

export default class MyAvatar extends Component<Props, State> {

    render() {

        let imageDim = 32;

        const user = currentUser();

        return (
            <TouchableOpacity onPress={()=>{
                //this is bad
                // this.props.navigator.toggleDrawer({
                //     side: 'left',
                //     animated: true
                // });


                Navigation.handleDeepLink({
                    link: PROFILE_CLICKED,
                });

            }}>
                <Image
                    source={{uri: user.image}}
                    style={{
                        height: imageDim,
                        width: imageDim,
                        borderRadius: imageDim / 2,
                    }}
                />
            </TouchableOpacity>
        )

    }
}
