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
    defaultValue?: string,
    canSendDefault?: boolean,
    containerStyle?: *,
    inputContainerStyle?: *,
    inputStyle?: *,
    height?: number,
    buttonStyle?: *,
    disabledButtonStyle?: *,
    button?: Node
};

type State = {
    input?: string,
    requestState?: RequestState,
    focus?: boolean
};

const HEIGHT = 40;

export default class SmartInput extends React.Component<Props, State> {

    state = {};

    static defaultProps = {
        defaultValue: '',
        button: <Image source={require('../../img/send.png')} resizeMode="contain"/>
    };



    constructor(props: Props) {
        super(props);
        this.state = {input: props.defaultValue}
    }

    render() {
        const {
            placeholder,
            buttonStyle,
            disabledButtonStyle,
            containerStyle,
            inputContainerStyle,
            inputStyle,
            canSendDefault,
            button,
            // height,
            ...attributes
        } = this.props;

        const height = this.props.height || HEIGHT;


        const {input} = this.state;

        return (
            <View style={[styles.container, containerStyle]}>
                <View style={[styles.inputContainer, inputContainerStyle, {minHeight: height}]}>
                    <TextInput
                        editable={!this.isSending()}
                        style={[styles.input, inputStyle, {color: this.isSending() ? UI.Colors.grey1 : 'black'}]}
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
                        isDisabled={(!canSendDefault && this.isDefault()) || this.isSending()}
                        onPress={this.exec.bind(this)}
                        style={[styles.button, buttonStyle, {height}]}
                        disabledStyle={[styles.disabledButton, disabledButtonStyle]}
                    >
                        {button}
                    </Button>

                }
            </View>


        );
    }

    isDefault() {
        return this.state.input === this.props.defaultValue;
    }

    showButton() {
        if (this.state.focus) return true;
        if (this.isSending()) return true;
        if (this.props.canSendDefault || !this.isDefault()) return true;
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
        borderWidth: StyleSheet.hairlineWidth,
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