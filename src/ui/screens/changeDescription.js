// @flow
import React, {Component} from 'react';
import {Alert, Clipboard, KeyboardAvoidingView, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
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
import {SFP_TEXT_BOLD, SFP_TEXT_MEDIUM, SFP_TEXT_REGULAR} from "../fonts";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import GTouchable from "../GTouchable";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import {Call} from "../../managers/Api";
import {renderSimpleButton} from "../UIStyles";

type Props = {
    activityId: Id,
    initialDescription: string,
    navigator: any,
    containerStyle:? any,
    onClickClose: () => void
};

type State = {
    description: string,
    isUpdating?: boolean
};

const MAX_LENGTH = 500;

@connect()
@logged
export default class ChangeDescriptionScreen extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    _sheet;

    constructor(props) {
        super(props);
        this.state= {description: props.initialDescription || ''};
    }


    render() {
        const {containerStyle, onClickClose} = this.props;

        let description = this.state.description;
        let notEditable = !!this.state.isUpdating;
        let updatable =  this.state.description !== this.props.initialDescription;


        return (
            <KeyboardAvoidingView
                contentContainerStyle={{flex:1}}
                scrollEnabled={false}
                extraScrollHeight={20}
                keyboardShouldPersistTaps='always'
                style={{position: 'absolute', bottom:0, top: 0, left: 0, right: 0}}
            >
                <Sheet
                    navigator={this.props.navigator}
                    ref={ref => this._sheet = ref}
                    // onBeforeClose={this.onBeforeClose.bind(this)}
                >
                    <View style={{height: 600, padding: 15}}>

                        {/*<Text style={styles.header}>{i18n.t("actions.ask")}</Text>*/}
                        <View style={{flexDirection: 'row'}}>
                            <GTouchable onPress={()=>this._sheet && this._sheet.close()}>
                                <Image style={{width: 15, height: 15}} source={require('../../img2/closeXGrey.png')}/>
                            </GTouchable>
                            <Text style={{
                                fontSize: 18,
                                lineHeight: 18,
                                marginLeft: 20,
                                textAlign: 'center',
                                fontFamily: SFP_TEXT_MEDIUM,
                            }}>{i18n.t("actions.change_description")}</Text>
                        </View>
                        <TextInput
                            editable={!notEditable}
                            onSubmitEditing={this.updateDescription.bind(this)}
                            value={description}
                            multiline={true}
                            numberOfLines={6}
                            maxLength={MAX_LENGTH}
                            blurOnSubmit
                            onChangeText={(description) => this.setState({description})}
                            placeholder={i18n.t("create_list_controller.add_description")}
                            // placeholderTextColor={"rgba(255,255,255,0.6)"}
                            autoFocus={true}
                            textAlignVertical={'top'}
                            // selectionColor={'transparent'}
                            style={[
                                {backgroundColor: 'transparent', marginVertical: 20},
                                styles.input,
                                (notEditable ? {color: "grey"} : {color: Colors.black}),
                            ]}
                            returnKeyType={'send'}
                        />
                        <View style={{flexDirection: 'row'}}>
                            {/*<View>*/}
                            {/*<Text style={{color: Colors.black, fontSize: 15}}>{`${MAX_LENGTH - (description || "").length}`}</Text>*/}
                            {/*</View>*/}
                            <View style={{flex: 1, alignItems: 'flex-end'}}>

                                {
                                    renderSimpleButton(
                                        i18n.t('actions.save'),
                                        () => this.updateDescription(),
                                        {
                                            loading: this.state.isUpdating,
                                            style: {alignSelf: 'flex-end'},
                                            disabled: !updatable,
                                            textStyle: {fontSize: 14, color:Colors.grey}
                                        }
                                    )

                                }
                            </View>
                        </View>

                    </View>

                </Sheet>
            </KeyboardAvoidingView>
        );
    }


    onBeforeClose(proceed: ()=>void, interupt: ()=>void) {

        if (!_.isEmpty(this.state.description)) {

            Alert.alert(
                i18n.t('actions.cancel'),
                i18n.t('ask.cancel'),
                [
                    {text: i18n.t('actions.cancel'), onPress: () => {
                        console.log('Cancel Pressed');
                        interupt();

                    }, style: 'cancel'},
                    {text: i18n.t('actions.ok'), onPress: () => {
                        proceed();
                    }},
                ],
                { cancelable: true }
            )
        }
        else {
            proceed();
        }

    }


    updateDescription() {

        if (this.state.isUpdating) return;
        this.setState({isUpdating: true});

        let description: string = this.state.description;
        let id: Id = this.props.activityId;

        this.props.dispatch(UPDATE_ACTIVITY.exec({id, description}))
            .then(()=> {
                Snackbar.show({
                    title: i18n.t('congrats.generic'),
                });
                this._sheet.close();
            });

    }

}

export const ACTIVITY_UPDATE = ApiAction.create("activity_update");


type ACTIVITY_UPDATE_PAYLOAD = {id: Id, description: string}

export const UPDATE_ACTIVITY: PendingAction<ACTIVITY_UPDATE_PAYLOAD>  = pendingActionWrapper(
    ACTIVITY_UPDATE,
    ({id, description}: ACTIVITY_UPDATE_PAYLOAD) => new Api.Call()
        .withMethod('PUT')
        .withRoute(`savings/${id}`)
        .withBody({saving: {description}})
);

const styles = StyleSheet.create({
    input:{
        // flex:1,
        //height: 140,
        fontSize: 18,
        lineHeight: 25,
        // textAlign: 'center',
        fontFamily: SFP_TEXT_REGULAR,
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
