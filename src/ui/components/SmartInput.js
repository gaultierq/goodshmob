// @flow

import type {Node} from 'react';
import React from 'react';
import {Image, StyleSheet, Text, TextInput, View} from 'react-native';
import {isEmpty} from "lodash";
import type {i18Key, RequestState} from "../../types";

import Button from 'apsl-react-native-button'
import {Colors} from "../colors";
import Icon from 'react-native-vector-icons/MaterialIcons';
import {STYLES} from "../UIStyles";

export type Props = {
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
    extendable?: boolean,
    button?: Node
};

type State = {
    input?: string,
    requestState?: RequestState,
    focus?: boolean,
    rounded?: boolean
};


export default class SmartInput extends React.Component<Props, State> {

    state = {};

    static defaultProps = {
        defaultValue: '',
        height: 40,
        button: <Icon name="send" size={20} color={Colors.greyishBrown}/>
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
            height,
            extendable,
            rounded,
            ...attributes
        } = this.props;

        const {input} = this.state;

        const isFocus = extendable ? this.state.focus : true;
        return (
            <View style={[styles.container, containerStyle, {flex:1, flexDirection: 'row'}]}>
                <View style={[
                    styles.inputContainer,
                    {flex:isFocus? 1: 0,
                        flexDirection: 'row',
                        minHeight: height,
                    },
                    rounded ? {
                        borderRadius: height / 2,
                        paddingHorizontal: height / 2,
                    } : {paddingHorizontal: height / 4},

                    inputContainerStyle,
                ]}>
                    <TextInput
                        editable={!this.isSending()}
                        style={[styles.input, inputStyle, {
                            flex: isFocus ? 1: 0,
                            color: this.isSending() ? Colors.greyishBrown : Colors.black,
                        }]}
                        onSubmitEditing={this.exec.bind(this)}
                        value={input}
                        onFocus={()=>this.setState({focus:true})}
                        onBlur={()=>this.setState({focus:false})}
                        onChangeText={input => this.setState({input})}
                        placeholder={i18n.t(placeholder)}
                        multiline={true}
                        maxHeight={70}
                        placeholderTextColor={Colors.grey3}
                        {...attributes}
                    />
                </View>
                {
                    this.showButton() && <View style={{flex: isFocus? 0: 1, flexDirection: 'row', alignItems: 'flex-start'}}>
                        <Button
                            isLoading={this.isSending()}
                            isDisabled={(!canSendDefault && this.isDefault()) || this.isSending()}
                            onPress={this.exec.bind(this)}
                            style={[STYLES.apslInit, styles.button, buttonStyle, {height, }]}
                            disabledStyle={[styles.disabledButton, buttonStyle, disabledButtonStyle]}
                        >
                            {button}
                        </Button>
                    </View>

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
        // alignItems: 'center',
    },
    inputContainer:{
        flex:1,
    },
    input:{
        fontSize: 18,
        // TODO: why we need this ?
        paddingTop:0,

        alignSelf: 'center',
    },
    button: {
        // height: HEIGHT,
        paddingBottom: 0,
        paddingLeft: 8,
        paddingRight: 8,
    },
    disabledButton: {
        borderColor: "transparent",
        opacity: 0.5
    },
});
