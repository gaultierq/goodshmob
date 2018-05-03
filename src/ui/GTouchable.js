//@flow

import React, {Component} from 'react';
import {TouchableNativeFeedback, TouchableOpacity, View,} from 'react-native';

import type {ms} from "../types";

export type Props = {
    onPress?: () => void,
    noprotect?: boolean,
    onDoublePress?: () => void,
    deactivated?: boolean, //skip the gtouchable completely
    disabledStyle?: *,
    style?: *
};

type State = {
};

const DELAY: ms = 200;
const DOUBLE_DELAY: ms = 300;

export default class GTouchable extends Component<Props, State>  {

    lastPress: ms = 0;

    lastExec: ms = 0;
    pending:? number;

    static defaultProps = {
        disabledStyle: {opacity: .5}
    };

    render() {
        const {
            noprotect,
            onPress,
            onDoublePress,
            deactivated,
            style,
            disabledStyle,
            ...attributes
        } = this.props;


        if (deactivated) return <View style={this.props.style}>{this.props.children}</View>;


        let _onPress;
        if (!noprotect || onDoublePress) {
            _onPress = () => {
                const now = Date.now();
                const lastPress = this.lastPress;
                this.lastPress = now;

                if (onDoublePress) {
                    //monde du double press
                    if (lastPress + DOUBLE_DELAY > now) {
                        clearTimeout(this.pending);
                        this.pending = null;

                        this.execProtectedPress(now, onDoublePress);
                    }
                    else {
                        this.pending = setTimeout(()=> {
                            this.execProtectedPress(now, onPress);
                        }, DOUBLE_DELAY);
                    }


                }
                else {
                    this.execProtectedPress(now, onPress);
                }
            };
        }
        else {
            _onPress = onPress;
        }
        let _style = this.props.disabled && disabledStyle ? [style, disabledStyle] : style;
        // return React.createElement(__IS_IOS__ ? TouchableOpacity : TouchableNativeFeedback, {onPress: _onPress, ...attributes});
        return React.createElement(TouchableOpacity, {onPress: _onPress, style: _style, ...attributes});
    }

    execProtectedPress(now: ms, exec: ()=>void) {
        if (this.lastExec + DELAY > now) {
            console.debug("click protected");

        }
        else {
            this.lastExec = now;
            exec && exec();
        }
    }
}

//just wrap the children in a touchable if the handler is present.
//TODO: rm this helper, and create state GTouchable unactive & deactive
export function wrapGtouchable(children: Node, handler: () => void) {
    return handler ? <GTouchable onPress={handler}>{children}</GTouchable> : children;
}