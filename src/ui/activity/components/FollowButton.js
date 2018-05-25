// @flow

import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {connect} from "react-redux";
import {
    currentGoodshboxId, isCurrentUser,
    logged
} from "../../../managers/CurrentUser"
import * as Api from "../../../managers/Api";
import type {Lineup, RequestState} from "../../../types";
import {Colors} from "../../colors";
import {renderSimpleButton} from "../../UIStyles";
import {
    FOLLOW_LINEUP, followLineupPending, UNFOLLOW_LINEUP,
    unfollowLineupPending
} from "../../lineup/actions";
import {isItemPending} from "../../../helpers/ModelUtils";
import {SFP_TEXT_REGULAR} from "../../fonts";

type Props = {
    lineup: Lineup,
};

type State = {
    reqFollow: RequestState,
};

@logged
@connect(state => ({
    pending: state.pending
}))
export default class FollowButton extends Component<Props, State> {


    state = {
        reqFollow: 'idle'
    }

    render() {

        const {lineup} = this.props;


        let followed = isFollowed.bind(this)(lineup)

        //TODO: use rights manager
        let followable = lineup.user && !isCurrentUser(lineup.user)

        return renderSimpleButton(
            followed ? i18n.t("actions.unfollow") : i18n.t("actions.follow"),
            () => {
                Api.safeExecBlock.call(
                    this,
                    () => followed ? unfollowLineupPending(this.props.dispatch, lineup) : followLineupPending(this.props.dispatch, lineup),
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
export function isFollowed(lineup: Lineup, ignorePending: boolean = false) {
    if (!ignorePending && isItemPending(lineup, this.props.pending[FOLLOW_LINEUP])) {
        return true
    }
    if (!ignorePending && isItemPending(lineup, this.props.pending[UNFOLLOW_LINEUP])) {
        return false
    }

    return _.get(lineup, 'meta.followed')
}

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
