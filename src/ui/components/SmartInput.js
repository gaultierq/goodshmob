// @flow

import type {Node} from 'react';
import React from 'react';
import {Image, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {isEmpty} from "lodash";
import type {i18Key, RequestState} from "../../types";
import {Colors} from "../colors";
import Icon from 'react-native-vector-icons/MaterialIcons';
import GTouchable from "../GTouchable";
import Spinner from 'react-native-spinkit';

export type Props = {
    placeholder: string,
    execAction: (input: string) => Promise<*>,
    defaultValue?: string,
    canSendDefault?: boolean,
    containerStyle?: *,
    inputContainerStyle?: *,
    inputStyle?: *,
    height: number,
    buttonStyle?: *,
    disabledButtonStyle?: *,
    extendable?: boolean,
    button?: Node
};

type State = {
    input?: string,
    requestState?: RequestState,
    focus: boolean,
    rounded?: boolean
};


export default class SmartInput extends React.Component<Props, State> {


    static defaultProps = {
        defaultValue: '',
        height: 40,
        placeholderTextColor: Colors.grey3
    };

    constructor(props: Props) {
        super(props);
        if (_.get(props, "style.height")) throw "invalid parameter style.height. use props"
        this.state = {
            focus: false,
            input: props.defaultValue
        }
    }

    render() {
        const {
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
            underlineColorAndroid,
            placeholderTextColor,
            ...attributes
        } = this.props;

        const {input} = this.state;
        let buttonInternal = button || <Icon name="send" size={height / 2} color={Colors.greyishBrown} style={{
            // backgroundColor: 'red',
        }} />;


        const isFocus = extendable ? this.state.focus : true;
        const computedUnderlineColorAndroid = underlineColorAndroid || placeholderTextColor || Colors.greyish;

        const transparentUnderlined = this.isTransparent(computedUnderlineColorAndroid);
        return (
            <View style={[styles.container, containerStyle, {flex:1, flexDirection: 'row'}]}>
                <View style={[
                    styles.inputContainer,
                    {
                        flex: isFocus? 1: 0,
                        flexDirection: 'row',
                        minHeight: height,
                    },
                    // rounded ? {
                    //         borderRadius: height / 2,
                    //         paddingHorizontal: height / 2,
                    //     } :
                    //     {paddingHorizontal: height / 4},

                    inputContainerStyle,
                ]}>
                    <TextInput
                        editable={!this.isSending()}

                        onSubmitEditing={this.exec.bind(this)}
                        value={input}
                        onFocus={()=>this.setState({focus:true})}
                        onBlur={()=>this.setState({focus:false})}
                        onChangeText={input => this.setState({input})}
                        underlineColorAndroid={computedUnderlineColorAndroid}
                        // multiline={true}
                        //why ? restore if something broken
                        // maxHeight={70}
                        placeholderTextColor={placeholderTextColor}
                        {...attributes}
                        style={
                            [
                                styles.input,
                                Platform.select({
                                    android: {
                                        paddingBottom: transparentUnderlined ? 0 : height / 12,
                                        paddingLeft: transparentUnderlined ? 0 : 2,
                                        // marginBottom: 0,
                                        // paddingBottom: 0
                                    },
                                }),
                                inputStyle,
                                {
                                    flex: isFocus ? 1: 0,
                                    opacity: this.isSending() ? 0.5 : 1,
                                    height,
                                    textAlignVertical: 'center',
                                    // textAlign: 'center', aligne le texte horizontalement
                                    // backgroundColor: 'purple', //RMME

                                }
                            ]}
                    />
                </View>
                {
                    buttonInternal && this.showButton() && this.renderButton(isFocus, canSendDefault, buttonStyle, disabledButtonStyle, buttonInternal)

                }
            </View>


        );
    }

    //TODO: better check
    isTransparent(computedUnderlineColorAndroid) {
        return computedUnderlineColorAndroid === 'transparent' || computedUnderlineColorAndroid === 'rgba(0,0,0,0)';
    }

    renderButton(isFocus, canSendDefault, buttonStyle, disabledButtonStyle, buttonInternal) {
        return (<View style={{
            flex: isFocus ? 0 : 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'yellow',
        }}>

            {
                this.isSending()
                    ? <Spinner isVisible={true} size={10} type={"WanderingCubes"} color={Colors.grey3}/>
                    : <GTouchable
                        disabled={(!canSendDefault && this.isDefault()) || this.isSending()}
                        disabledStyle={[styles.disabledButton, buttonStyle, disabledButtonStyle]}
                        onPress={this.exec.bind(this)}>
                        {buttonInternal}
                    </GTouchable>

            }
            {/*<Button*/}
            {/*isLoading={this.isSending()}*/}
            {/*isDisabled={(!canSendDefault && this.isDefault()) || this.isSending()}*/}
            {/*onPress={this.exec.bind(this)}*/}
            {/*style={[STYLES.apslInit, styles.button, buttonStyle, {height, backgroundColor: 'blue'}]}*/}
            {/*disabledStyle={[styles.disabledButton, buttonStyle, disabledButtonStyle]}*/}
            {/*>*/}
            {/*{buttonInternal}*/}
            {/*</Button>*/}
        </View>);
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

        const promise = this.props.execAction(this.state.input);
        promise
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
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,

        textAlignVertical: 'center', //android only
        // alignSelf: 'center',
    },
    // button: {
    //     paddingBottom: 0,
    //     paddingLeft: 8,
    //     paddingRight: 8,
    // },
    disabledButton: {
        borderColor: "transparent",
        opacity: 0.5
    },
});
