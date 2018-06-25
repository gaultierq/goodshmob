// @flow
import React, {Component} from 'react'
import type {ActivityType, Id} from "../../types"
import {connect} from "react-redux"
import {logged} from "../../managers/CurrentUser"
import * as Api from "../../managers/Api"
import ApiAction from "../../helpers/ApiAction"

import _Messenger from "../../managers/Messenger"
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view"
import type {PendingAction} from "../../helpers/ModelUtils"
import {pendingActionWrapper} from "../../helpers/ModelUtils"
import ModalTextInput from "./modalTextInput"
import {buildData, sanitizeActivityType} from "../../helpers/DataUtils"

type Props = {
    activityId: Id,
    activityType: ActivityType,

    // initialDescription: string,
    navigator: any,
    containerStyle:? any,
    data:? any,
};

type State = {
    isUpdating?: boolean
};


@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
export default class ChangeDescriptionScreen extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    initialDescription:? string;

    constructor(props: Props) {
        super(props);
        this.state= {description: props.initialDescription || ''};
    }


    render() {
        const {navigator, data, activityType, activityId} = this.props;
        let activity = buildData(data, activityType, activityId);
        if (this.initialDescription === undefined && activity) {
            this.initialDescription = activity.description || "";
        }

        return <ModalTextInput
            initialText={this.initialDescription}
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
                _Messenger.sendMessage(i18n.t('congrats.generic'));
            });

    }
}

export const ACTIVITY_UPDATE = ApiAction.create("activity_update", "update an activity");


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
