// @flow

import React, {Component} from 'react';
import {Image, View} from 'react-native';
import {Colors} from "./colors";
import User from "react-native-firebase/lib/modules/auth/user";
import {CachedImage} from "react-native-img-cache";

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
        backgroundColor: Colors.dirtyWhite,
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
        ListHeaderComponent: TRANSPARENT_SPACER(10)(),
        style: {backgroundColor: Colors.dirtyWhite}
    };

}
