// @flow
import React, {Component} from 'react'
import {
    Alert,
    Clipboard,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import type {RequestState} from "../../types"
import {CheckBox} from "react-native-elements"
import {connect} from "react-redux"
import {currentUser, currentUserId, logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api"
import ApiAction from "../../helpers/ApiAction"

import _Messenger from "../../managers/Messenger"
import {Colors} from "../colors"
import {SFP_TEXT_BOLD} from "../fonts"
import {renderSimpleButton} from "../UIStyles"
import {Avatar, registerLayoutAnimation, scheduleOpacityAnimation} from "../UIComponents"
import {FETCH_ACTIVITIES, fetchMyNetwork} from "../networkActions"

type Props = {
};

type State = {
    isFocused?: boolean,
    askContent?: string,
    reqCreateAsk?: RequestState,
};


@connect()
@logged
export default class AskInput extends Component<Props, State> {
    state= {};

    render() {

        let askContent = this.state.askContent;
        const asking = this.state.reqCreateAsk === 'sending'
        let buttonDisabled = asking || !askContent;
        const notEditable = asking


        const buttonColor = Colors.brownishGrey

        return <View style={{padding: 10}}>

            <View style={{
                // backgroundColor: Colors.white,
                flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.greyish}}>
                <Avatar user={currentUser()}/>
                <TextInput
                    editable={!notEditable}
                    onSubmitEditing={this.createAsk.bind(this)}
                    value={askContent}
                    multiline={true}
                    numberOfLines={6}
                    maxLength={200}
                    blurOnSubmit
                    onFocus={()=> {this.setFocused(true)}}
                    onBlur={()=> {this.setFocused(false)}}
                    onChangeText={(askContent) => this.setState({askContent})}
                    placeholder={i18n.t("actions.ask_friend")}
                    // placeholderTextColor={"rgba(255,255,255,0.6)"}
                    // textAlignVertical={'top'}
                    // selectionColor={'transparent'}
                    style={[
                        styles.input,
                        {opacity: (notEditable ? 0.5 : 1)},
                        {minHeight: 50}
                    ]}
                    returnKeyType={'send'}
                />
            </View>


            <View style={{flexDirection: 'row'}}>

                {
                    (this.state.isFocused || !!this.state.askContent) && (
                        <View style={{flex: 1, marginTop: 15, alignItems: 'flex-end'}}>
                            {renderSimpleButton(
                                i18n.t("actions.ask_button"),
                                () => this.createAsk(),
                                {
                                    loading: asking,
                                    style: {alignSelf: 'flex-end'},
                                    disabled: buttonDisabled,
                                    textStyle: {
                                        color: buttonColor,
                                        fontSize: 16,
                                        borderWidth: 1,
                                        borderColor: buttonColor,
                                        borderRadius: 6,
                                        padding: 4,
                                        paddingHorizontal: 6
                                    }
                                }
                            )}

                            {<Text style={{
                                opacity: !!this.state.askContent && !notEditable ? 1 : 0,
                                color: buttonColor,
                                fontSize: 11,
                            }}>{`${200 - (askContent || "").length}`}</Text>}
                        </View>
                    )
                }
            </View>
        </View>;
    }

    setFocused(isFocused) {
        scheduleOpacityAnimation()
        this.setState({isFocused})
    }

    createAsk() {
        let content = this.state.askContent;
        if (!content || content.length < 10) {
            Alert.alert(i18n.t('actions.ask'), i18n.t('ask.minimal_length'))
            return
        }
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            createAskAction(content).createActionDispatchee(CREATE_ASK),
            'reqCreateAsk'
        ).then(() => {
            _Messenger.sendMessage(i18n.t('ask.sent'));
            this.setState({askContent: ''})

            //TODO: this is a hack, use firebase messagine service
            setTimeout(() => {
                this.props.dispatch(
                    fetchMyNetwork()
                    .createActionDispatchee(FETCH_ACTIVITIES, {userId: currentUserId(), mergeOptions: {drop: true}}))
            }, 1000)


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
        fontSize: 20,
        // lineHeight: 35,
        // textAlign: 'center',
        fontFamily: SFP_TEXT_BOLD,
        borderRadius: 10,
        margin: 10,
        color: Colors.greyishBrown,
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
