// @flow
import React, {Component} from 'react';
import {Alert, Clipboard, KeyboardAvoidingView, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {Ask, Id, ItemType, RequestState} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";

import _Messenger from "../../managers/Messenger"
import {Colors} from "../colors";
import {SFP_TEXT_BOLD} from "../fonts";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import {renderSimpleButton} from "../UIStyles";
import {
    actions as userActions,
    actionTypes as userActionTypes
} from "../../redux/UserActions"

type Props = {
};

type State = {
    askContent?: string,
    isAsking?: boolean,
    reqCreateAsk?: RequestState,
};


@connect()
@logged
export default class AskInput extends Component<Props, State> {
    state= {};

    render() {

        let askContent = this.state.askContent;
        let buttonDisabled = this.state.isAsking || !askContent;
        const ok = this.state.reqCreateAsk === 'ok'
        const notEditable = this.state.isAsking || ok;


        return (
            <View style={{backgroundColor: Colors.green, paddingHorizontal: 10, paddingTop: 10}}>

                <TextInput
                    editable={!notEditable}
                    onSubmitEditing={this.createAsk.bind(this)}
                    value={askContent}
                    multiline={true}
                    numberOfLines={6}
                    maxLength={200}
                    blurOnSubmit
                    onChangeText={(askContent) => this.setState({askContent})}
                    placeholder={i18n.t("actions.ask_friend")}
                    placeholderTextColor={"rgba(255,255,255,0.6)"}
                    autoFocus={false}
                    textAlignVertical={'top'}
                    selectionColor={'transparent'}
                    style={[
                        styles.input,
                        (notEditable ? {backgroundColor: Colors.transparent} : {backgroundColor: Colors.darkerGreen}),
                    ]}
                    returnKeyType={'send'}
                />


                <View style={{flexDirection: 'row'}}>

                    <View style={{flex: 1, alignItems: 'flex-end', opacity: !ok ? 1 : 0}}>
                        {renderSimpleButton(
                            i18n.t("actions.ask_button"),
                            ()=>this.createAsk(),
                            {
                                loading: this.state.isAsking,
                                style: {alignSelf: 'flex-end'},
                                disabled: buttonDisabled,
                                textStyle: {
                                    color: Colors.white,
                                    fontSize: 16,
                                    borderWidth: 1,
                                    borderColor: Colors.white,
                                    borderRadius: 6,
                                    padding: 4,
                                    paddingHorizontal: 6
                                }
                            }
                        )}

                        {<Text style={{opacity: !!this.state.askContent && !notEditable ? 1 : 0,
                            color: Colors.white,
                            fontSize: 11,}}>{`${200 - (askContent || "").length}`}</Text>}
                    </View>
                </View>
            </View>
        );
    }

    createAsk() {
        let content = this.state.askContent;
        if (!content) return;

        if (content.length < 10) {
            Alert.alert(i18n.t('actions.ask'), i18n.t('ask.minimal_length'))
            return
        }
        if (this.state.isAsking) return;
        this.setState({isAsking: true});



        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            createAskAction(content).createActionDispatchee(CREATE_ASK),
            'reqCreateAsk'
        ).then(function () {
            _Messenger.sendMessage(i18n.t('ask.sent'));
        })

    }

}

export const createAskAction = (content: string) => {
    return new Api.Call()
        .withMethod('POST')
        .withRoute("asks")
        .withBody({ask: {content}})
}
export const CREATE_ASK = ApiAction.create("create_ask", "asked for network");


const styles = StyleSheet.create({
    input:{
        fontSize: 30,
        lineHeight: 35,
        textAlign: 'center',
        fontFamily: SFP_TEXT_BOLD,
        borderRadius: 10,
        margin: 10,
        color: Colors.white,
        borderColor: Colors.greyishBrown,

    },
    header:{
        fontSize: 16,
        color: Colors.white
    },
    disabledButton: {
        borderColor: Colors.greyishBrown,
    }
});
