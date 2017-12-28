//@flow

import React, {Component} from 'react';
import {
    TouchableNativeFeedback,
    TouchableOpacity,
} from 'react-native';

export type Props = {
    protect?: boolean
};

type State = {
};

export default class GTouchable extends Component<Props, State>  {

    render() {
        const {
            protect,
            ...attributes
        } = {...this.props};
        return React.createElement(__IS_IOS__ ? TouchableOpacity : TouchableNativeFeedback, attributes);
    }

}


