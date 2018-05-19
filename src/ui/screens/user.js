// @flow
import React from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import type {Id, RequestState} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"
import ActivityCell from "../activity/components/ActivityCell";
import Screen from "../components/Screen";
import {LINEUP_SECTIONS, MainBackground} from "../UIComponents";
import * as UI from "../UIStyles";
import {STYLES} from "../UIStyles";
import UserLineups from "./userLineups";
import {fullName} from "../../helpers/StringUtils";
import * as Api from "../../managers/Api"
import {buildData} from "../../helpers/DataUtils"
import ApiAction from "../../helpers/ApiAction"
import {
    actions as userActions,
    actionTypes as userActionTypes
} from "../../redux/UserActions"

type Props = {
    userId: Id,
    user:? User,
    navigator: any,
    network: *
};

type State = {
    reqFetchUser?: RequestState
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
    pending: state.pending
});

@logged
@connect(mapStateToProps)
export default class UserScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false,
        // those props only affect Android
        navBarTitleTextCentered: true,
        navBarSubTitleTextCentered: true,
    };

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        Api.safeDispatchAction.call(
            this,
            this.props.dispatch,
            userActions.getUser(this.props.userId).createActionDispatchee(userActionTypes.GET_USER),
            'reqFetchUser'
        )
    }

    getUser() {
        return buildData(this.props.data, "users", this.props.userId);
    }

    render() {
        let user = this.props.user || this.getUser();

        let userId = this.props.userId;
        //FIXME: rm platform specific code, https://github.com/wix/react-native-navigation/issues/1871
        if (this.isVisible() && user) {
            if (__IS_IOS__) {
                this.props.navigator.setStyle({...UI.NavStyles,
                    navBarCustomView: 'goodsh.UserNav',
                    navBarCustomViewInitialProps: {
                        user: user,
                    }
                });
            }
            else {
                this.setNavigatorTitle(this.props.navigator, {title: fullName(user)})
            }
        }

        return (
            <MainBackground>
                <UserLineups
                    displayName={"user feed"}
                    feedId={"user list"}
                    userId={userId}
                    navigator={this.props.navigator}
                    empty={<Text style={STYLES.empty_message}>{i18n.t('lineups.empty_screen')}</Text>}
                    // initialLoaderDelay={500}
                    renderSectionHeader={({section}) => section.renderSectionHeader()}
                    sectionMaker={LINEUP_SECTIONS(this.props.navigator, this.props.dispatch, userId)}

                />
            </MainBackground>
        );
    }
}
