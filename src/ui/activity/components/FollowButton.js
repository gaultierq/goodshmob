// @flow

import React, {Component} from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../../managers/CurrentUser"
import * as Api from "../../../managers/Api"
import type {Lineup, RequestState} from "../../../types"
import {Colors} from "../../colors"
import {renderSimpleButton} from "../../UIStyles"
import {followLineupPending, unfollowLineupPending} from "../../lineup/actions"
import {SFP_TEXT_REGULAR} from "../../fonts"
import StoreManager from "../../../managers/StoreManager"
import {L_FOLLOW, L_UNFOLLOW, LineupRights} from "../../rights"

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
        let rights = new LineupRights(lineup)
        let canFollow = rights.canExec(L_FOLLOW)
        let canUnfollow = rights.canExec(L_UNFOLLOW)

        if (canFollow === null && canUnfollow === null) return null

        let followable = canFollow === true

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
// return null if we don't know (eg: when item is pending)
export function isFollowed(lineup: Lineup) {
    if (StoreManager.isListPendingFollowOrUnfollow(lineup.id)) return null
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
