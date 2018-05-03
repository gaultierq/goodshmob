// @flow
import React from 'react';
import {Clipboard, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, User, View} from 'react-native';
import type {Id, RequestState} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {isCurrentUserId, logged} from "../../managers/CurrentUser"
import Feed from "../components/feed";
import {FETCH_ACTIVITIES, fetchUserNetwork} from "../networkActions";
import ActivityCell from "../activity/components/ActivityCell";
import Screen from "../components/Screen";
import {activityFeedProps, MainBackground} from "../UIComponents";
import {STYLES} from "../UIStyles";
import ShareButton from "../components/ShareButton";
import UserLineups from "./userLineups";
import LineupHorizontal, {LineupH1} from "../components/LineupHorizontal";
import {seeActivityDetails, seeList, startAddItem} from "../Nav";
import * as UI from "../UIStyles";
import {fullName} from "../../helpers/StringUtils";
import * as Api from "../../managers/Api"
import {buildData} from "../../helpers/DataUtils"
import ApiAction from "../../helpers/ApiAction"

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

const GET_USER = ApiAction.create("get_user", "get the user");
const actions = (() => {
    return {
        getUserAndTheirLists: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: ""
                }
            )
            .createActionDispatchee(GET_USER),
    };
})();

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
            actions.getUserAndTheirLists(this.props.userId),
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
                    initialLoaderDelay={500}

                    sectionMaker={(lineups)=> {
                        // const goodshbox = _.head(lineups);
                        // let savingCount = _.get(goodshbox, `meta.savingsCount`, null) || 0;
                        const navigator = this.props.navigator;
                        return lineups.map(lineup => ({
                            data: [lineup],
                            title:lineup.name,
                            subtitle: ` (${_.get(lineup, `meta.savingsCount`, null) || 0})`,
                            onPress: () => seeList(navigator, lineup),
                            renderItem: ({item}) => (
                                <LineupH1
                                    lineup={item}
                                    navigator={navigator}
                                    skipLineupTitle={true}
                                    onPressEmptyLineup={isCurrentUserId(userId) ? ()=>startAddItem(navigator, item.id): null } />
                            )
                        }));
                    }}

                />
            </MainBackground>
        );
    }


    renderItem({item}) {

        return (
            <ActivityCell
                onPressItem={() => this.navToActivity(item)}
                activityId={item.id}
                activityType={item.type}
                navigator={this.props.navigator}
            />
        )
    }
}
