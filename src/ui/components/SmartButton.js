// @flow

import type {Node} from 'react';
import React from 'react';
import {Image, StyleSheet, Text, TextInput, View} from 'react-native';
import {isEmpty} from "lodash";
import type {i18Key, RequestState} from "../../types";
import Button from 'apsl-react-native-button'
import {Colors} from "../colors";


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


//depreacted: this is probably not a good idea
export default class SmartButton extends React.Component<Props, State> {

    state = {};

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {
            style,
            disabledButtonStyle,
            textStyle,
            textKey,
            button,
            disabled,
            ...attributes
        } = this.props;

        let color = disabled ? Colors.greyishBrown : Colors.black;
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
                {button || <Text style={[{color, fontWeight: "bold", fontSize: 18}, textStyle]}>{text}</Text>}
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
        borderColor: Colors.greyishBrown,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 6,
        backgroundColor: Colors.white,
    },
    input:{
        fontSize: 18,

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
