//@flow

import React, {Component} from 'react';
import {TouchableNativeFeedback, TouchableOpacity,} from 'react-native';
import type {ms} from "../types";

export type Props = {
    noprotect?: boolean,
    onDoublePress?: () => void
};

type State = {
};

const DELAY: ms = 200;
const DOUBLE_DELAY: ms = 300;

export default class GTouchable extends Component<Props, State>  {

    lastPress: ms = 0;

    lastExec: ms = 0;
    pending: number;

    render() {
        const {
            noprotect,
            onPress,
            onDoublePress,
            ...attributes
        } = {...this.props};

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

        return React.createElement(__IS_IOS__ ? TouchableOpacity : TouchableNativeFeedback, {onPress: _onPress, ...attributes});
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


