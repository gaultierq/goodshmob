// @flow

import type {Node} from 'react';
import React from 'react';
import {Image, StyleSheet, Text, TextInput, View} from 'react-native';
import {isEmpty} from "lodash";
import type {i18Key, RequestState} from "../../types";
import Button from 'apsl-react-native-button'
import * as UI from "../UIStyles";
import {Colors} from "../UIStyles";
import i18n from '../../i18n/i18n'

type Props = {

    execAction: () => Promise<*>,


    height?: number,

    textKey?: i18Key,
    style?: *,
    textStyle?: *,
    disabledButtonStyle?: *,
    disabled?: boolean,
    button?: Node
};

type State = {
    requestState?: RequestState,
};

export default class SmartButton extends React.Component<Props, State> {

    state = {};

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {
            style,
            disabledButtonStyle,
            textKey,
            button,
            disabled,
            ...attributes
        } = this.props;

        let color = disabled ? Colors.grey1 : Colors.black;
        let text = i18n.t(textKey);
        let sending = this.isSending();
        return (<Button
                isLoading={sending}
                isDisabled={sending}
                onPress={this.exec}
                style={[styles.button, style]}
                disabledStyle={styles.disabledButton}
                {...attributes}
            >
                {button || <Text style={{color, fontWeight: "bold", fontSize: 18, fontFamily: "Chivo"}}>{text}</Text>}
            </Button>
        );
    }


    exec = () => {
        if (this.isSending()) {
            console.debug("already executing action");
            return;
        }
        let setReqState = (requestState) => {
            this.setState({requestState});
        };
        setReqState('sending');

        this.props.execAction()
            .then(()=> {
                setReqState('ok');
            }, (err) => {
                console.warn(err);
                setReqState('ko');

            });
    }

    isSending() {
        return this.state.requestState === 'sending';
    }
}


const styles = StyleSheet.create({

    container:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputContainer:{

        flex:1,
        justifyContent: "center",
        // minHeight: HEIGHT,
        borderColor: UI.Colors.grey1,
        borderWidth: 0.5,
        borderRadius: 6,
        backgroundColor: 'white',
    },
    input:{
        fontSize: 18,
        fontFamily: 'Chivo',
    },
    button: {
        // height: HEIGHT,
        marginBottom: 0,
        marginLeft: 8,
        marginRight: 8,
        borderWidth: 0,
        // backgroundColor: 'blue',
    },
    disabledButton: {
        borderColor: "transparent",
        opacity: 0.5
    },
});