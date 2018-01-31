// @flow
import React, {Component} from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import type {Ask, Id, ItemType} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";

import Snackbar from "react-native-snackbar"
import Button from 'apsl-react-native-button'
import {Colors} from "../colors";
import Sheet from "../components/sheet";
import {SFP_TEXT_BOLD} from "../fonts";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import GTouchable from "../GTouchable";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import {Call} from "../../managers/Api";

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
        return (
            <KeyboardAwareScrollView
                contentContainerStyle={{flex:1}}
                scrollEnabled={false}
                keyboardShouldPersistTaps={true}
                // style={{position: 'absolute', bottom:0, top: 0}}
            >
                <Sheet
                    navigator={this.props.navigator}
                    ref={ref => this._sheet = ref}
                >
                    <View style={{height: 400, backgroundColor: Colors.green, padding: 15}}>

                        {/*<Text style={styles.header}>{i18n.t("actions.ask")}</Text>*/}
                        <GTouchable onPress={()=>this._sheet && this._sheet.close()}>
                            <Image source={require('../../img2/closeXWhite.png')}/>
                        </GTouchable>
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
                        <View style={{flexDirection: 'row'}}>
                            <View>
                                <Text style={{color: Colors.white, fontSize: 15}}>{`${200 - (askContent || "").length}`}</Text>
                            </View>
                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                                <GTouchable
                                    onPress={()=>this.createAsk()}
                                    style={{backgroundColor: Colors.white, borderRadius: 6, padding: 4, paddingRight: 8, paddingLeft: 8}}>
                                    <Text style={{color: Colors.green, fontSize: 14}}>SEND</Text>
                                </GTouchable>
                            </View>
                        </View>

                    </View>

                </Sheet>
            </KeyboardAwareScrollView>
        );
    }

    createAsk() {

        let content = this.state.askContent;
        if (!content) return;
        if (this.state.isAsking) return;
        this.setState({isAsking: true});

        this.props.dispatch(ASK_CREATION.pending({content}, undefined));
        Snackbar.show({
            title: i18n.t('ask.sent'),
        });
        this._sheet.close();
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

export const CREATE_ASK = ApiAction.create("create_ask");

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
