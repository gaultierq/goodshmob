// @flow
import React, {Component} from 'react';
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
} from 'react-native';
import type {Id} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";

import Snackbar from "react-native-snackbar"
import {Colors} from "../colors";
import {SFP_TEXT_REGULAR} from "../fonts";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import ModalTextInput from "./modalTextInput";

type Props = {
    activityId: Id,
    initialDescription: string,
    navigator: any,
    containerStyle:? any,
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
        const {containerStyle, initialDescription, navigator} = this.props;


        return <ModalTextInput
            initialText={initialDescription}
            navigator={navigator}
            requestAction={input=>this.updateDescription(input)}
            placeholder={i18n.t("create_list_controller.add_description")}
        />
    }

    updateDescription(newDescription: string) {

        return this.props.dispatch(UPDATE_ACTIVITY.exec({id: this.props.activityId, newDescription}))
            .then(()=> {
                //TODO: Use Messenger
                Snackbar.show({
                    title: i18n.t('congrats.generic'),
                });
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
        fontSize: 18,
        lineHeight: 25,
        fontFamily: SFP_TEXT_REGULAR,
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
