// @flow

import type {Node} from 'react';
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
    children: Node,
    // If onBeforeClose is undefined, the sheet will close
    onBeforeClose: () => void,

};

type State = {
    height: number,
    opened?: ? boolean
};

export default class Sheet extends React.Component<Props, State> {


    _modal;

    constructor(props: Props) {
        super(props);
        let h = _.get(props, 'children.props.style.height');
        if (!_.isNumber(h)) throw "Sheet need its direct children to have a fixed height";
        this.state = {height: h};
    }

    render() {
        let height = _.get(this.props, 'children.props.style.height');
        return (
            <Modal
            ref={modal=>this._modal = modal}
                position={'bottom'}
                   onClosed={this.onClose.bind(this)}
                   onOpened={()=>this.setState({opened:true})}
                   isOpen={true}
                   backButtonClose={true}
                   style={{height}}>{this.props.children}</Modal>
        );
    }

    onClose() {
        console.debug("onClosed");
        if (this.props.onBeforeClose) {
            this.props.onBeforeClose(()=>this.finishClose(), ()=>this.open())
        }
        else {
            this.finishClose();
        }
    }


    finishClose() {
        this.props.navigator.dismissModal({animationType: 'none'});
    }

    open() {
        this._modal.open();
    }
}