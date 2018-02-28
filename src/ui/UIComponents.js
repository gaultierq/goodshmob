// @flow

import React, {Component} from 'react';
import {StyleSheet, Image, Text, View} from 'react-native';
import {Colors} from "./colors";
import User from "react-native-firebase/lib/modules/auth/user";
import {CachedImage} from "react-native-img-cache";
import GTouchable from "./GTouchable";
import {SFP_TEXT_ITALIC} from "./fonts";
import {FEED_INITIAL_LOADER_DURATION, STYLES} from "./UIStyles";

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
        backgroundColor: Colors.dirtyWhite2,
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
        initialLoaderDelay: FEED_INITIAL_LOADER_DURATION
    };
}

//TODO: useless, inline
export function renderTag(tag: string, onPress: () => void, style?:?*) {
    return (<GTouchable onPress={onPress}>
        <Text style={[STYLES.tag, style]}>{tag}</Text>
    </GTouchable>);
}
