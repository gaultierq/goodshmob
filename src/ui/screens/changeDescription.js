// @flow
import React, {Component} from 'react';
import type {ActivityType, Id} from "../../types";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api";
import ApiAction from "../../helpers/ApiAction";

import Snackbar from "react-native-snackbar"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import ModalTextInput from "./modalTextInput";
import {sanitizeActivityType} from "../../helpers/DataUtils";

type Props = {
    activityId: Id,
    activityType: ActivityType,

    initialDescription: string,
    navigator: any,
    containerStyle:? any,
};

type State = {
    isUpdating?: boolean
};

@connect()
@logged
export default class ChangeDescriptionScreen extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    constructor(props) {
        super(props);
        this.state= {description: props.initialDescription || ''};
    }


    render() {
        const {initialDescription, navigator} = this.props;


        return <ModalTextInput
            initialText={initialDescription}
            navigator={navigator}
            requestAction={input=>this.updateDescription(input)}
            placeholder={i18n.t("create_list_controller.add_description")}
            numberOfLines={6}
            maxLength={500}
            height={600}
            title={i18n.t("actions.change_description")}
        />
    }

    updateDescription(description: string) {

        return this.props.dispatch(UPDATE_ACTIVITY.exec({
            id: this.props.activityId,
            type: sanitizeActivityType(this.props.activityType),
            description}))
            .then(()=> {
                //TODO: Use Messenger
                Snackbar.show({
                    title: i18n.t('congrats.generic'),
                });
            });

    }
}

export const ACTIVITY_UPDATE = ApiAction.create("activity_update");


type ACTIVITY_UPDATE_PAYLOAD = {id: Id, type: ActivityType, description: string}


//ffs
let makeUpdateBody = (type,description) => {
    switch (sanitizeActivityType(type)) {
        case 'savings':
            return {saving: {description}};
        case 'sendings':
            return {sending: {description}};
        case 'asks':
            return {ask: {description}};
    }
    return null;
};

export const UPDATE_ACTIVITY: PendingAction<ACTIVITY_UPDATE_PAYLOAD>  = pendingActionWrapper(
    ACTIVITY_UPDATE,
    ({id, type, description}: ACTIVITY_UPDATE_PAYLOAD) => new Api.Call()
        .withMethod('PUT')
        .withRoute(`${type}/${id}`)
        .withBody(makeUpdateBody(type, description))
);
