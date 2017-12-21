// @flow

import React from 'react';
import {View} from 'react-native';
import {Colors} from "./colors";

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
    }}>{props.children}</View>;