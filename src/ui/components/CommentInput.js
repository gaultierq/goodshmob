// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import Immutable from 'seamless-immutable';
import * as Api from "../../managers/Api";
import {Call} from "../../managers/Api";
import type {Activity, ActivityType, Id} from "../../types";
import ApiAction from "../../helpers/ApiAction";
import {doDataMergeInState, sanitizeActivityType} from "../../helpers/DataUtils";
import type {Props as SmartInputProps} from "../components/SmartInput";
import SmartInput from "../components/SmartInput";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import {connect} from "react-redux";


export const CREATE_COMMENT = ApiAction.create("create_comment");

type Props = {
    activity: Activity,
    ...SmartInputProps
};

type State = {
};

@connect()
class CommentInput extends Component<Props, State> {

    render() {

        let {activity, ...attributes} = this.props;
        return (
            <SmartInput
                returnKeyType={'send'}
                execAction={(input: string) => this.addComment(activity, input)}
                {...attributes}
            />
        );
    }

    addComment(activity: Activity, newComment: string) {
        let delayMs = 3000;
        let activityId = activity.id;
        let activityType = sanitizeActivityType(activity.type);
        let content = newComment;

        let payload = {activityId, activityType, content};
        let options = {delayMs, activityId, activityType};

        return this.props.dispatch(COMMENT_CREATION.pending(payload, options))
    }
}

type COMMENT_CREATION_PAYLOAD = {activityType: ActivityType, activityId: Id, content: string}

export const COMMENT_CREATION: PendingAction<COMMENT_CREATION_PAYLOAD>  = pendingActionWrapper(
    CREATE_COMMENT,
    ({activityType, activityId, content}: COMMENT_CREATION_PAYLOAD) => new Call()
        .withMethod('POST')
        .withRoute(`${activityType}/${activityId}/comments`)
        .addQuery({include: "user"})
        .withBody({comment: {content}})
);

const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case CREATE_COMMENT.success(): {

                let {id, type} = action.payload.data;
                let {activityId, activityType} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;
                state = doDataMergeInState(state, path, [{id, type}], {reverse: true});
                break;
            }
        }
        return state;
    }
})();

let component = CommentInput;

export {component, reducer};
