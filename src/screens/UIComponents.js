import React, {Component} from 'react';
import {ImageBackground} from 'react-native';

export const MainBackground = (props) => <ImageBackground
        source={require('../img/home_background.png')}
        style={{
            flex: 1,
            position: 'absolute',
            width: '100%',
            height: '100%',
        }}>{props.children}</ImageBackground>;