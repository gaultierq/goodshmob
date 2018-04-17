// @flow

import React, {Component} from 'react';
import {Image, LayoutAnimation, StyleSheet, Text, View, UIManager} from 'react-native';
import {Colors} from "./colors";
import User from "react-native-firebase/lib/modules/auth/user";
import {CachedImage} from "react-native-img-cache";
import GTouchable from "./GTouchable";
import {BACKGROUND_COLOR, STYLES} from "./UIStyles";
import Spinner from 'react-native-spinkit';
import type {RequestState} from "../types";


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



export function floatingButtonScrollListener() {
    if (typeof this.state.isActionButtonVisible !== 'boolean') throw "bad usage";
    let that = this;
    return function() {
        if (that.floatingButtonScrollListener) return that.floatingButtonScrollListener;
        var _listViewOffset;

        if (__IS_ANDROID__) {
            UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        }

        return (that.floatingButtonScrollListener = function(event)  {

            // Check if the user is scrolling up or down by confronting the new scroll position with your own one
            const currentOffset = event.nativeEvent.contentOffset.y

            const diff = currentOffset - _listViewOffset;
            if (Math.abs(diff) < 100) return;

            const direction = (currentOffset > 0 && diff > 0) ? 'down' : 'up'

            // Simple fade-in / fade-out animation
            const CustomLayoutLinear = {
                duration: 200,
                create: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity },
                update: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity },
                delete: { type: LayoutAnimation.Types.linear, property: LayoutAnimation.Properties.opacity }
            }

            // If the user is scrolling down (and the action-button is still visible) hide it
            const isActionButtonVisible = direction === 'up'
            if (isActionButtonVisible !== that.state.isActionButtonVisible) {
                LayoutAnimation.configureNext(CustomLayoutLinear)
                that.setState({ isActionButtonVisible })
            }
            // Update your scroll position
            _listViewOffset = currentOffset
        })
    }();

}