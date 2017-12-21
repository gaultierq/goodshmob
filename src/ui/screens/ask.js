// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {Ask, Id, ItemType} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import Closable from "./closable";
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";

import Snackbar from "react-native-snackbar"
import Button from 'apsl-react-native-button'
import {Colors} from "../colors";

type Props = {
    itemId: Id,
    itemType: ItemType,
    navigator: any,
    containerStyle:? any,
    onClickClose: () => void
};

type State = {
    askContent?: string,
    isAsking?: boolean
};


@connect()
export default class AskScreen extends Component<Props, State> {

    state= {};

    render() {
        const {containerStyle, onClickClose} = this.props;

        let askContent = this.state.askContent;
        let buttonDisabled = this.state.isAsking || !askContent;
        let notEditable = this.state.isAsking;
        return (
            <Closable
                onClickClose={onClickClose}
                containerStyle={containerStyle}
            >

                <View style={{height: 300, margin: 16}}>
                    <Text style={styles.header}>Sollicitez vos amis</Text>
                    <TextInput
                        editable={!notEditable}
                        onSubmitEditing={this.createAsk.bind(this)}
                        value={askContent}
                        multiline
                        onChangeText={(askContent) => this.setState({askContent})}
                        placeholder={"#Poser une question à vos amis"}
                        autoFocus
                        style={[
                            styles.input,
                            (notEditable ? {color: "grey"} : {color: "black"}),
                            {marginTop: 15}
                        ]}
                        returnKeyType={'send'}
                    />
                    <Button
                        isLoading={this.state.isAsking}
                        isDisabled={buttonDisabled}
                        onPress={()=> this.createAsk()}
                        style={[styles.button, {marginTop: 15}]}
                        disabledStyle={styles.disabledButton}
                    >
                        <Text style={{color: buttonDisabled ? Colors.grey1 : Colors.white}}>Envoyer</Text>
                    </Button>
                </View>
            </Closable>
        );
    }

    createAsk() {

        let content = this.state.askContent;
        if (!content) return;
        if (this.state.isAsking) return;
        this.setState({isAsking: true});

        this.props
            .dispatch(actions.createAsk({content}).disptachForAction2(CREATE_ASK))
            .then(()=> {
                Snackbar.show({
                    title: i18n.t('ask.sent'),
                });

                this.props.onClickClose();

            }, (err)=>console.log(err))
            .then(()=> this.setState({isAsking: false}));
    }

}

const CREATE_ASK = ApiAction.create("create_ask");

const actions = {
    createAsk: (ask: Ask): Api.Call => {
        return new Api.Call()
            .withMethod('POST')
            .withRoute("asks")
            .withBody({ask})
            ;
    }
};

const styles = StyleSheet.create({
    input:{
        height: 140,
        height: 140,
        width: "100%",
        fontFamily: 'Chivo',
        fontSize: 18,
        // borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.grey1,
        borderRadius: 5

    },
    header:{
        fontSize: 16,
        fontFamily: 'Chivo',
        color: Colors.white
    },
    button: {
        padding: 8,
        height: 30,
        color: Colors.white,
        borderColor: Colors.white,
    },
    disabledButton: {
        borderColor: Colors.grey1,
    }
});

