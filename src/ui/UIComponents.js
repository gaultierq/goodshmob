// @flow

import React, {Component} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Colors} from "./colors";
import User from "react-native-firebase/lib/modules/auth/user";
import {CachedImage} from "react-native-img-cache";
import GTouchable from "./GTouchable";
import {BACKGROUND_COLOR, STYLES} from "./UIStyles";
import Spinner from 'react-native-spinkit';

// export const MainBackground = (props) => <ImageBackground
//         source={require('../img/home_background.png')}
//         style={{
//             // flex: 1,
//             position: 'absolute',
//             width: '100%',
//             height: '100%',
//         }}>{props.children}</ImageBackground>;



export const MainBackground = (props) => <View
    style={{
        // flex: 1,
        backgroundColor: BACKGROUND_COLOR,
        position: 'absolute',
        width: '100%',
        height: '100%',
    }}>{props.children}
</View>;



type Props = {
    user: User,
    style: any
}
type State = {}

export class Avatar extends Component<Props, State> {

    render() {
        const {user, style} = this.props;

        const {dim, ...otherStyles} = style;

        return <CachedImage
            source={{uri: user.image}}
            style={[otherStyles, {
                height: dim,
                width: dim,
                borderRadius: dim / 2,

            }]}
        />
    }
}

export const TRANSPARENT_SPACER = (height: number) => ()=><View style={{height, backgroundColor: 'transparent'}}/>;


export function activityFeedProps() {
    return {
        ItemSeparatorComponent: TRANSPARENT_SPACER(20),
        ListHeaderComponent: TRANSPARENT_SPACER(0)(),
        style: {backgroundColor: Colors.greying},
    };
}

//TODO: useless, inline
export function renderTag(tag: string, onPress: () => void, style?:?*) {
    return (<GTouchable onPress={onPress}>
        <Text style={[STYLES.tag, style]}>{tag}</Text>
    </GTouchable>);
}


export const FullScreenLoader = props => (<View style={{
    flex:1,
    width: "100%",
    height: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.65)'
}}>
    <Spinner
        isVisible={true}
        size={__DEVICE_WIDTH__ / 5}
        type={"WanderingCubes"}
        color={Colors.green}/>
</View>);
