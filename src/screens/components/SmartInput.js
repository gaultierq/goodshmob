// @flow

import type {Node} from 'react';
import React from 'react';
import {StyleSheet, TextInput, View, Image} from 'react-native';
import {isEmpty} from "lodash";
import type {i18Key, RequestState} from "../../types";
import i18n from '../../i18n/i18n'
import Button from 'apsl-react-native-button'
import * as UI from "../UIStyles";

type Props = {
    placeholder: i18Key,
    execAction: (input: string) => Promise<*>,
    containerStyle?: *,
    inputContainerStyle?: *,
    buttonStyle?: *,
    disabledButtonStyle?: *,
};

type State = {
    input?: string,
    requestState?: RequestState,
    focus?: boolean
};

export default class SmartInput extends React.Component<Props, State> {


    state = {};

    render() {
        const {
            placeholder,
            buttonStyle,
            disabledButtonStyle,
            containerStyle,
            inputContainerStyle,
            ...attributes
        } = this.props;

        const {input} = this.state;

        return (
            <View style={[styles.container, containerStyle]}>
                <View style={[styles.inputContainer, inputContainerStyle]}>
                    <TextInput
                        editable={!this.isSending()}
                        style={[styles.input, {color: this.isSending() ? UI.Colors.grey1 : 'black'}]}
                        onSubmitEditing={this.exec.bind(this)}
                        value={input}
                        onFocus={()=>this.setState({focus:true})}
                        onBlur={()=>this.setState({focus:false})}
                        onChangeText={input => this.setState({input})}
                        placeholder={i18n.t(placeholder)}
                        {...attributes}
                    />
                </View>
                {
                    this.showButton() && <Button
                        isLoading={this.isSending()}
                        isDisabled={!this.state.input || this.isSending()}
                        onPress={this.exec.bind(this)}
                        style={[styles.button, buttonStyle]}
                        disabledStyle={[styles.disabledButton, disabledButtonStyle]}
                    >
                        <Image style={styles.image} source={require('../../img/send.png')} resizeMode="contain"/>
                    </Button>

                }
            </View>


        );
    }

    showButton() {
        if (this.state.focus) return true;
        if (this.isSending()) return true;
        if (this.state.input) return true;
        return false;
    }

    exec() {
        if (this.isSending()) {
            console.debug("already executing action");
            return;
        }
        let setReqState = (requestState) => {
            this.setState({requestState});
        };
        setReqState('sending');

        this.props.execAction(this.state.input)
            .then(()=> {
                setReqState('ok');
                this.setState({input: ''})
            }, (err) => {
                console.warn(err);
                this.setState({requestState: 'ko'})

            });
    }

    isSending() {
        return this.state.requestState === 'sending';
    }
}

const HEIGHT = 40;
const styles = StyleSheet.create({

    container:{
        flexDirection: 'row',
        alignItems: 'center',
        // minHeight: HEIGHT,
        // backgroundColor: 'red',
    },
    inputContainer:{

        flex:1,
        padding: 0,
        justifyContent: "center",
        minHeight: HEIGHT,
        borderColor: UI.Colors.grey1,
        borderWidth: 0.5,
        borderRadius: 6,
        backgroundColor: 'white',
    },
    input:{

        fontSize: 18,
        fontFamily: 'Chivo',
    },
    image: {
    },
    button: {
        height: HEIGHT,
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