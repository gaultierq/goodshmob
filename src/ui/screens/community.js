// @flow

import React from 'react'
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Platform,
    RefreshControl,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import type {NavigableProps} from "../../types"
import Screen from "../components/Screen"
import {PagerPan, TabView} from "react-native-tab-view"
import {connect} from "react-redux"
import {renderTabBarFactory} from "../UIComponents"
import type {Contact} from "./contact_list"
import ContactList, {createHandler, toPerson} from "./contact_list"
import FriendsScreen from "./friends"
import {currentUser, currentUserId} from "../../managers/CurrentUser"
import PersonRowI from "../activity/components/PeopleRow"
import GButton from "../components/GButton"
import AppShareButton from "../components/AppShareButton"
import {LINEUP_PADDING} from "../UIStyles"
import {Colors} from "../colors"
import InviteManyContacts from "./invite_many_contacts"
import {displaySavingActions} from "../Nav"
import * as Nav from "../Nav"

type Props = NavigableProps & {
    initialIndex: number,
    searchOptions?: any
}

type State = {
    index: number,
    routes: any,
};

const ROUTES = [
    {key: 'friends', title: "amis"}, {key: 'contacts', title: 'contacts'}
]

const NAV_USER_SEARCH = 'user_search'

@connect()
export default class CommunityScreen extends Screen<Props, State> {

    static navigatorStyle = {
        navBarNoBorder: true,
        topBarElevationShadowEnabled: false
    }

    static defaultProps = {
        initialIndex: 0,
    }


    constructor(props: Props) {
        super(props)

        const routes = ROUTES
        if (_.get(currentUser(), 'meta.friendsCount') === 0) {
            _.remove(routes, r => r.key === 'friends')
        }

        this.state = {
            routes,
            index: _.toNumber(props.initialIndex)
        }

        props.navigator.addOnNavigatorEvent((event) => {

            if (event.type === 'NavBarButtonPress') {
                if (event.id === NAV_USER_SEARCH) {
                    this.props.navigator.showModal({
                        screen: 'goodsh.UserSearchScreen',
                        title: i18n.t("search.in_users"),
                        navigatorButtons: Nav.CANCELABLE_MODAL
                    });
                }
            }
        });
    }



    render() {

        this.props.navigator.setButtons({
            // leftButtons: [],
            rightButtons: this.state.index === 0 ? [{
                id: NAV_USER_SEARCH,
                icon: require('../../img2/search.png'),
            }] : []
        })

        return <TabView
            style={{flex: 1}}
            navigationState={{...this.state}}
            renderScene={this.renderScene.bind(this)}
            renderTabBar={this.state.routes.length === 1 ? () => null : renderTabBarFactory(this.isFocused.bind(this))}
            renderPager={props => <PagerPan {...props} />}
            swipeEnabled={false}
            onIndexChange={index => {
                this.setState({index})
            }}
        />
    }

    isFocused(route) {
        return this.state.index === ROUTES.indexOf(route)
    }

    renderScene({ route}: *) {
        let ix = ROUTES.indexOf(route)
        let focused = this.state.index === ix
        const visible: boolean = super.isVisible()
        switch (route.key) {
            case 'friends': return (
                <FriendsScreen
                    userId={currentUserId()}
                    navigator={this.props.navigator}
                    // focused={visible && focused}
                />
            )
            case 'contacts': return (
                <InviteManyContacts
                    navigator={this.props.navigator}
                    // renderItem={({item}) => renderContact(item)}
                />
            )
        }
    }
}
