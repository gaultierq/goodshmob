import type {Node} from 'react';
// @flow
import React from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import Modal from 'react-native-modalbox';


type Props = {
    children: Node
};

type State = {
    height: number
};

export default class Sheet extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        let h = _.get(props, 'children.props.style.height');
        if (!_.isNumber(h)) throw "Sheet need its direct children to have a fixed height";
        this.state = {height: h};
    }

    render() {
        let height = _.get(this.props, 'children.props.style.height');
        return (
            <Modal position={'bottom'}
                onClosed={() => this.props.navigator.dismissModal({animationType: 'none'})}
                   isOpen={true}
                   style={{height}}>{this.props.children}</Modal>
        );
    }
}