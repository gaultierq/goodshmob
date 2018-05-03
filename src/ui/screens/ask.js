// @flow
import React, {Component} from 'react';
import {Alert, Clipboard, KeyboardAvoidingView, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {Ask, Id, ItemType} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";

import _Messenger from "../../managers/Messenger"
import Button from 'apsl-react-native-button'
import {Colors} from "../colors";
import Sheet from "../components/sheet";
import {SFP_TEXT_BOLD} from "../fonts";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import GTouchable from "../GTouchable";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import {Call} from "../../managers/Api";
import {renderSimpleButton} from "../UIStyles";

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
@logged
export default class AskScreen extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    _sheet;

    state= {};

    render() {
        const {containerStyle, onClickClose} = this.props;

        let askContent = this.state.askContent;
        let buttonDisabled = this.state.isAsking || !askContent;
        let notEditable = this.state.isAsking;
        //TODO: this shouldnt not be platform specific...
        return (
            <KeyboardAwareScrollView
                contentContainerStyle={{flex: __IS_IOS__ ? 0 : 1}}
                scrollEnabled={false}
                keyboardShouldPersistTaps='always'
            >
                <Sheet
                    navigator={this.props.navigator}
                    ref={ref => this._sheet = ref}
                    onBeforeClose={this.onBeforeClose.bind(this)}
                >

                    <View style={{height: 300, backgroundColor: Colors.green, padding: 15}}>

                        {/*<Text style={styles.header}>{i18n.t("actions.ask")}</Text>*/}


                        <View style={{flexDirection: 'row'}}>
                            <GTouchable onPress={()=>this._sheet && this._sheet.close()}>
                                <Image source={require('../../img2/closeXWhite.png')}/>
                            </GTouchable>
                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                                {renderSimpleButton(
                                    // i18n.t("actions.logout"),
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

                                {<Text style={{opacity: !!this.state.askContent ? 1 : 0, color: Colors.white, fontSize: 11,}}>{`${200 - (askContent || "").length}`}</Text>}
                            </View>
                        </View>

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
                            autoFocus={true}
                            textAlignVertical={'top'}
                            selectionColor={'transparent'}
                            style={[
                                {backgroundColor: 'transparent', margin: 20},
                                styles.input,
                                (notEditable ? {color: "grey"} : {color: Colors.white}),
                            ]}
                            returnKeyType={'send'}
                        />


                    </View>


                </Sheet>
            </KeyboardAwareScrollView>

        );
    }


    onBeforeClose(proceed: ()=>void, interupt: ()=>void) {


        if (_.isEmpty(this.state.askContent) || this.state.isAsking) {
            proceed();
        }
        else {

            Alert.alert(
                i18n.t('actions.cancel'),
                i18n.t('ask.cancel'),
                [
                    {
                        text: i18n.t('actions.cancel'), onPress: () => {
                        console.log('Cancel Pressed');
                        interupt();

                    }, style: 'cancel'
                    },
                    {
                        text: i18n.t('actions.ok'), onPress: () => {
                        proceed();
                    }
                    },
                ],
                {cancelable: true}
            )
        }

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

        this.props.dispatch(ASK_CREATION.pending({content}, {}));
        _Messenger.sendMessage(i18n.t('ask.sent'));

        //hack: on bundled android, no timeout will crash the app
        setTimeout(()=> {
            this._sheet.close();
        }, 1000)

        // this.props
        //     .dispatch(actions.createAsk({content}).disptachForAction2(CREATE_ASK))
        //     .then(()=> {
        //         Snackbar.show({
        //             title: i18n.t('ask.sent'),
        //         });
        //         this._sheet.close();
        //         // this.props.onClickClose();
        //
        //     }, (err)=>console.log(err))
        //     .then(()=> this.setState({isAsking: false}));
    }

}

export const CREATE_ASK = ApiAction.create("create_ask", "asked for network");

// const actions = {
//     createAsk: (ask: Ask): Api.Call => {
//         return new Api.Call()
//             .withMethod('POST')
//             .withRoute("asks")
//             .withBody({ask})
//             ;
//     }
// };



type ASK_CREATION_PAYLOAD = {content: string}

export const ASK_CREATION: PendingAction<ASK_CREATION_PAYLOAD>  = pendingActionWrapper(
    CREATE_ASK,
    ({content}: ASK_CREATION_PAYLOAD) => new Api.Call()
        .withMethod('POST')
        .withRoute("asks")
        .withBody({ask: {content}})
);

const styles = StyleSheet.create({
    input:{
        // flex:1,
        //height: 140,
        fontSize: 30,
        lineHeight: 35,
        textAlign: 'center',
        fontFamily: SFP_TEXT_BOLD,
        // borderWidth: StyleSheet.hairlineWidth,
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
