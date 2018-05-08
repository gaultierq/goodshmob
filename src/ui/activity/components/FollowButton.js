// @flow

import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {currentUserId, isCurrentUser, logged} from "../../../managers/CurrentUser"
import * as Api from "../../../managers/Api";
import type {Lineup, RequestState} from "../../../types";
import {doDataMergeInState} from "../../../helpers/DataUtils";
import {Colors} from "../../colors";
import {renderSimpleButton} from "../../UIStyles";
import {FETCH_SAVINGS, followLineup, unfollowLineup} from "../../lineup/actions";
import ApiAction from "../../../helpers/ApiAction";
import {SFP_TEXT_REGULAR} from "../../fonts";

type Props = {
    lineup: Lineup,
};

type State = {
    reqFollow: RequestState,
};

@logged
@connect()
export default class FollowButton extends Component<Props, State> {


    state = {
        reqFollow: 'idle'
    }

    render() {

        const {lineup} = this.props;


        let followed = isFollowed(lineup)

        //TODO: use rights manager
        let followable = isCurrentUser(lineup.user)

        return renderSimpleButton(
            followed ? i18n.t("actions.unfollow") : i18n.t("actions.follow"),
            () => {
                Api.safeExecBlock.call(
                    this,
                    () => followed ? unfollowLineup(this.props.dispatch, lineup) : followLineup(this.props.dispatch, lineup),
                    'reqFollow'
                )
            },
            {
                disabled: !followable,
                loading: this.state.reqFollow === 'sending',
                style: {alignSelf: 'flex-start'},
                textStyle: styles.footerButton
            }
        )

    }
}

//TODO: create decorators when building
export function isFollowed(lineup: Lineup) {
    return _.get(lineup, 'meta.followed', false)
}

const reducer = (() => {

    return (state = {}, action = {}) => {

        switch (action.type) {
            case FETCH_SAVINGS.success(): {
                let {listId, mergeOptions} = action.options;
                let path = `lists.${listId}.relationships.savings.data`;
                state = doDataMergeInState(state, path, action.payload.data, mergeOptions);
                break;
            }
        }
        return state;
    }
})();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    description: {
        backgroundColor: 'transparent',
        margin: 10
    },
    footerButton: {
        fontSize:15, fontWeight: 'normal', fontFamily: SFP_TEXT_REGULAR, color: Colors.greyish
    },
});
